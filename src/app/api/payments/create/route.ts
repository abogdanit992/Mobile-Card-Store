import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createProviderPayment,
  getEnabledChannelConfig,
} from "@/lib/payments/service";
import type { Provider } from "@/lib/payments/types";

type CreateBody = {
  productId?: string;
  contactEmail?: string;
  contactPhone?: string;
  provider?: Provider;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isProvider(value: unknown): value is Provider {
  return (
    value === "cryptomus" ||
    value === "nowpayments" ||
    value === "stripe" ||
    value === "paypal"
  );
}

async function getOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateBody;
  const productId = body.productId;
  const contactEmail = body.contactEmail?.trim().toLowerCase();
  const contactPhone = body.contactPhone?.trim();
  const provider = body.provider;

  if (!productId) {
    return NextResponse.json({ error: "Missing productId." }, { status: 400 });
  }
  if (!contactEmail && !contactPhone) {
    return NextResponse.json(
      { error: "Provide an email or a phone number." },
      { status: 400 },
    );
  }
  if (contactEmail && !isValidEmail(contactEmail)) {
    return NextResponse.json({ error: "Invalid contact email." }, { status: 400 });
  }
  if (contactPhone && contactPhone.length < 6) {
    return NextResponse.json({ error: "Invalid contact phone." }, { status: 400 });
  }
  if (!isProvider(provider)) {
    return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,title,name_en,price,active")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  const config = await getEnabledChannelConfig(admin, provider);
  if (!config) {
    return NextResponse.json(
      { error: "This payment method is not available." },
      { status: 400 },
    );
  }

  // Create pending order
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert([
      {
        product_id: product.id,
        amount: product.price,
        status: "pending",
        user_id: user?.id ?? null,
        contact_email: contactEmail ?? null,
        contact_phone: contactPhone ?? null,
      },
    ])
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order." },
      { status: 500 },
    );
  }

  const currency = "USD";
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert([
      {
        order_id: order.id,
        provider,
        status: "pending",
        amount: product.price,
        currency,
      },
    ])
    .select("id")
    .single();

  if (paymentError || !payment) {
    return NextResponse.json(
      { error: paymentError?.message ?? "Failed to create payment." },
      { status: 500 },
    );
  }

  const origin = await getOrigin();

  try {
    const result = await createProviderPayment({
      provider,
      config,
      orderId: order.id,
      paymentId: payment.id,
      amount: product.price,
      currency,
      productName: product.name_en ?? product.title,
      contactEmail: contactEmail ?? "",
      successUrl: `${origin}/payment/return?orderId=${order.id}`,
      cancelUrl: `${origin}/checkout?productId=${product.id}`,
      callbackUrl: `${origin}/api/payments/webhook/${provider}`,
    });

    await admin
      .from("payments")
      .update({ provider_payment_id: result.providerPaymentId ?? null })
      .eq("id", payment.id);

    return NextResponse.json({ ok: true, redirectUrl: result.redirectUrl });
  } catch (err) {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    const message = err instanceof Error ? err.message : "Payment failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
