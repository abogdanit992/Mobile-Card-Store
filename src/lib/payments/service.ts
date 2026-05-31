import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ChannelConfig, CreatePaymentParams, Provider } from "./types";
import { createCryptomusPayment } from "./cryptomus";
import { createDirectUsdtPayment } from "./direct-usdt";
import { createNowPaymentsPayment } from "./nowpayments";
import { createStripePayment } from "./stripe";
import { createPaypalPayment } from "./paypal";
import { createWechatPayment } from "./wechat";
import { createAlipayPayment } from "./alipay";
import { sendCardEmail } from "@/lib/email/send";

type AdminClient = SupabaseClient<Database>;

export async function getEnabledChannelConfig(
  admin: AdminClient,
  provider: Provider,
): Promise<ChannelConfig | null> {
  const { data } = await admin
    .from("payment_channels")
    .select("config,enabled")
    .eq("provider", provider)
    .maybeSingle();

  if (!data || !data.enabled) return null;
  return (data.config ?? {}) as ChannelConfig;
}

/** Resolve PayPal REST credentials for personal, business, or legacy rows. */
export async function getPaypalChannelConfig(
  admin: AdminClient,
  provider: string,
): Promise<ChannelConfig | null> {
  if (provider === "paypal_personal" || provider === "paypal_business") {
    return getEnabledChannelConfig(admin, provider);
  }
  return (
    (await getChannelConfig(admin, "paypal_business")) ??
    (await getChannelConfig(admin, "paypal"))
  );
}

async function getChannelConfig(
  admin: AdminClient,
  provider: Provider,
): Promise<ChannelConfig | null> {
  const { data } = await admin
    .from("payment_channels")
    .select("config,enabled")
    .eq("provider", provider)
    .maybeSingle();

  if (!data?.config) return null;
  return (data.config ?? {}) as ChannelConfig;
}

/** Config for webhooks (ignores enabled flag — order may complete after admin disables channel). */
export async function getPaymentChannelConfig(
  admin: AdminClient,
  provider: Provider,
): Promise<ChannelConfig | null> {
  return getChannelConfig(admin, provider);
}

export async function createProviderPayment(params: CreatePaymentParams) {
  switch (params.provider) {
    case "cryptomus":
      return createCryptomusPayment(params);
    case "nowpayments":
      return createNowPaymentsPayment(params);
    case "stripe":
      return createStripePayment(params);
    case "paypal":
    case "paypal_personal":
    case "paypal_business":
      return createPaypalPayment(params);
    case "wechat":
      return createWechatPayment(params);
    case "alipay":
      return createAlipayPayment(params);
    case "direct_usdt":
      return createDirectUsdtPayment(params);
    default:
      throw new Error("Unsupported provider.");
  }
}

/**
 * Allocate an unused card to a paid order (idempotent-ish).
 * Returns the card code or null if no inventory.
 */
export async function allocateCardForOrder(
  admin: AdminClient,
  orderId: string,
  productId: string,
): Promise<string | null> {
  // Already allocated?
  const { data: existing } = await admin
    .from("cards")
    .select("code")
    .eq("used_order_id", orderId)
    .maybeSingle();
  if (existing?.code) return existing.code;

  const { data: card } = await admin
    .from("cards")
    .select("id,code")
    .eq("product_id", productId)
    .eq("used", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!card) return null;

  const { error: claimError, data: claimed } = await admin
    .from("cards")
    .update({
      used: true,
      used_order_id: orderId,
      used_at: new Date().toISOString(),
    })
    .eq("id", card.id)
    .eq("used", false)
    .select("code")
    .maybeSingle();

  if (claimError || !claimed) return null;
  return claimed.code;
}

/** Upsert a marketing customer profile from a paid order. */
export async function upsertCustomerFromOrder(
  admin: AdminClient,
  params: { email: string | null; phone: string | null; amount: number },
) {
  const email = params.email?.trim().toLowerCase() || null;
  const phone = params.phone?.trim() || null;
  if (!email && !phone) return;

  let existingId: string | null = null;
  let existingCount = 0;
  let existingSpent = 0;
  let existingEmail: string | null = null;
  let existingPhone: string | null = null;

  if (email) {
    const { data } = await admin
      .from("customers")
      .select("id,order_count,total_spent,email,phone")
      .eq("email", email)
      .maybeSingle();
    if (data) {
      existingId = data.id;
      existingCount = data.order_count;
      existingSpent = Number(data.total_spent);
      existingEmail = data.email;
      existingPhone = data.phone;
    }
  }
  if (!existingId && phone) {
    const { data } = await admin
      .from("customers")
      .select("id,order_count,total_spent,email,phone")
      .eq("phone", phone)
      .maybeSingle();
    if (data) {
      existingId = data.id;
      existingCount = data.order_count;
      existingSpent = Number(data.total_spent);
      existingEmail = data.email;
      existingPhone = data.phone;
    }
  }

  const now = new Date().toISOString();

  if (existingId) {
    await admin
      .from("customers")
      .update({
        order_count: existingCount + 1,
        total_spent: existingSpent + params.amount,
        last_order_at: now,
        email: existingEmail ?? email,
        phone: existingPhone ?? phone,
      })
      .eq("id", existingId);
  } else {
    await admin.from("customers").insert([
      {
        email,
        phone,
        order_count: 1,
        total_spent: params.amount,
        last_order_at: now,
      },
    ]);
  }
}

/** Mark payment + order paid, allocate a card, record customer, email card. */
export async function fulfillPaidOrder(orderId: string, providerPaymentId?: string) {
  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id,product_id,status,amount,contact_email,contact_phone")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false as const, reason: "order_not_found" };

  await admin
    .from("payments")
    .update({
      status: "paid",
      provider_payment_id: providerPaymentId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  const alreadyPaid = order.status === "paid";
  if (!alreadyPaid) {
    await admin.from("orders").update({ status: "paid" }).eq("id", orderId);
  }

  const code = await allocateCardForOrder(admin, order.id, order.product_id);

  // Only record customer / send email once (on first transition to paid).
  if (!alreadyPaid) {
    await upsertCustomerFromOrder(admin, {
      email: order.contact_email,
      phone: order.contact_phone,
      amount: Number(order.amount),
    });

    if (order.contact_email && code) {
      const { data: product } = await admin
        .from("products")
        .select("name_en,title")
        .eq("id", order.product_id)
        .maybeSingle();

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "https://vkeyshop.co";
      await sendCardEmail({
        to: order.contact_email,
        productName: product?.name_en ?? product?.title ?? "Your order",
        code,
        orderId: order.id,
        siteUrl,
      });
    }
  }

  return { ok: true as const, code };
}
