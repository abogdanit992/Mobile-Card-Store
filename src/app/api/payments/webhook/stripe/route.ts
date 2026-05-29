import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEnabledChannelConfig, fulfillPaidOrder } from "@/lib/payments/service";
import { parseStripeWebhook, verifyStripeWebhook } from "@/lib/payments/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  const admin = createSupabaseAdminClient();
  const config = await getEnabledChannelConfig(admin, "stripe");
  if (!config) {
    return NextResponse.json({ error: "channel disabled" }, { status: 400 });
  }

  if (!verifyStripeWebhook(rawBody, signature, config)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  const result = parseStripeWebhook(event);

  if (!result.orderId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (result.status === "paid") {
    await fulfillPaidOrder(result.orderId, result.providerPaymentId ?? undefined);
  } else if (result.status === "failed" || result.status === "expired") {
    await admin
      .from("payments")
      .update({ status: result.status })
      .eq("order_id", result.orderId);
    await admin
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", result.orderId)
      .neq("status", "paid");
  }

  return NextResponse.json({ ok: true });
}
