import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEnabledChannelConfig, fulfillPaidOrder } from "@/lib/payments/service";
import {
  parseNowPaymentsWebhook,
  verifyNowPaymentsWebhook,
} from "@/lib/payments/nowpayments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json()) as Record<string, unknown>;
  const signature = request.headers.get("x-nowpayments-sig");

  const admin = createSupabaseAdminClient();
  const config = await getEnabledChannelConfig(admin, "nowpayments");
  if (!config) {
    return NextResponse.json({ error: "channel disabled" }, { status: 400 });
  }

  if (!verifyNowPaymentsWebhook(payload, config, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const result = parseNowPaymentsWebhook(payload);
  if (!result.orderId) {
    return NextResponse.json({ error: "missing order" }, { status: 400 });
  }

  await admin
    .from("payments")
    .update({ raw: payload as never, updated_at: new Date().toISOString() })
    .eq("order_id", result.orderId);

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
