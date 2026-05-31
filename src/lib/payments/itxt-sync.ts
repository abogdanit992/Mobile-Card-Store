import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Provider } from "./types";
import { queryItxtPayment } from "./itxt-pay";
import { fulfillPaidOrder, getEnabledChannelConfig } from "./service";

type AdminClient = SupabaseClient<Database>;

const ITXT_PROVIDERS = new Set<Provider>(["wechat", "alipay"]);

function merOrderTidFromRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const v = (raw as Record<string, unknown>).merOrderTid;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function payUrlFromRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const v = (raw as Record<string, unknown>).payUrl;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

const ITXT_REUSE_WINDOW_MS = 30 * 60 * 1000;

/** Reuse a recent pending WeChat/Alipay checkout instead of calling the gateway again. */
export async function findReusableItxtCheckout(
  admin: AdminClient,
  params: {
    productId: string;
    provider: "wechat" | "alipay";
    contactEmail?: string | null;
    contactPhone?: string | null;
  },
): Promise<{ orderId: string; payUrl: string } | null> {
  const since = new Date(Date.now() - ITXT_REUSE_WINDOW_MS).toISOString();

  let orderQuery = admin
    .from("orders")
    .select("id")
    .eq("product_id", params.productId)
    .eq("status", "pending")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(8);

  if (params.contactEmail) {
    orderQuery = orderQuery.eq("contact_email", params.contactEmail);
  } else if (params.contactPhone) {
    orderQuery = orderQuery.eq("contact_phone", params.contactPhone);
  } else {
    return null;
  }

  const { data: orders } = await orderQuery;
  if (!orders?.length) return null;

  for (const order of orders) {
    const { data: payment } = await admin
      .from("payments")
      .select("provider,status,raw")
      .eq("order_id", order.id)
      .maybeSingle();

    if (
      payment?.provider === params.provider &&
      payment.status === "pending"
    ) {
      const payUrl = payUrlFromRaw(payment.raw);
      if (payUrl) {
        return { orderId: order.id, payUrl };
      }
    }
  }

  return null;
}

export function isItxtProvider(provider: string): provider is "wechat" | "alipay" {
  return ITXT_PROVIDERS.has(provider as Provider);
}

/** Poll gateway and fulfill if paid (used on return page + status API). */
export async function syncItxtPaymentIfPending(
  admin: AdminClient,
  orderId: string,
): Promise<"paid" | "pending" | "failed"> {
  const { data: payment } = await admin
    .from("payments")
    .select("provider,status,raw,provider_payment_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!payment || payment.status === "paid") {
    return payment?.status === "paid" ? "paid" : "pending";
  }
  if (!isItxtProvider(payment.provider)) return "pending";

  const merOrderTid = merOrderTidFromRaw(payment.raw);
  if (!merOrderTid) return "pending";

  const config = await getEnabledChannelConfig(admin, payment.provider);
  if (!config) return "pending";

  const result = await queryItxtPayment(config, merOrderTid);
  if (!result) return "pending";

  await admin
    .from("payments")
    .update({
      raw: {
        ...(typeof payment.raw === "object" && payment.raw ? payment.raw : {}),
        merOrderTid,
        tid: result.tid,
        payOrderStatus: result.payOrderStatus,
        ...(result.payUrl?.trim() ? { payUrl: result.payUrl.trim() } : {}),
      } as never,
      provider_payment_id: result.tid,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  if (result.payOrderStatus === 1) {
    await fulfillPaidOrder(orderId, result.tid);
    return "paid";
  }
  if (result.payOrderStatus === 2 || result.payOrderStatus === 3) {
    await admin.from("payments").update({ status: "failed" }).eq("order_id", orderId);
    return "failed";
  }
  if (result.payOrderStatus === 4) {
    await admin.from("payments").update({ status: "expired" }).eq("order_id", orderId);
    return "failed";
  }

  return "pending";
}

/** Load or refresh gateway payUrl for the scan payment page. */
export async function resolveItxtPayUrl(
  admin: AdminClient,
  orderId: string,
): Promise<string | null> {
  const { data: payment } = await admin
    .from("payments")
    .select("provider,status,raw")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!payment || !isItxtProvider(payment.provider)) return null;

  const existing = payUrlFromRaw(payment.raw);
  if (existing) return existing;

  const merOrderTid = merOrderTidFromRaw(payment.raw);
  if (!merOrderTid) return null;

  const config = await getEnabledChannelConfig(admin, payment.provider);
  if (!config) return null;

  const result = await queryItxtPayment(config, merOrderTid);
  const payUrl = result?.payUrl?.trim();
  if (!payUrl) return null;

  await admin
    .from("payments")
    .update({
      raw: {
        ...(typeof payment.raw === "object" && payment.raw ? payment.raw : {}),
        merOrderTid,
        payUrl,
        ...(result?.tid ? { tid: result.tid } : {}),
      } as never,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  return payUrl;
}
