import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Provider } from "@/lib/payments/types";
import {
  parseItxtWebhook,
  verifyItxtWebhook,
  type ItxtWebhookPayload,
} from "@/lib/payments/itxt-pay";
import { fulfillPaidOrder, getPaymentChannelConfig } from "@/lib/payments/service";
import type { ChannelConfig } from "@/lib/payments/types";

function verifyCallbackIp(request: Request, config: ChannelConfig): boolean {
  const raw = config.callback_ips?.trim();
  if (!raw) return true;

  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length === 0) return true;

  const forwarded = request.headers.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "";

  return allowed.includes(candidate);
}

export async function handleItxtWebhook(
  request: Request,
  provider: Extract<Provider, "wechat" | "alipay">,
) {
  const payload = (await request.json()) as ItxtWebhookPayload;

  const admin = createSupabaseAdminClient();
  const config = await getPaymentChannelConfig(admin, provider);
  if (!config?.merchant_secret) {
    return new NextResponse("channel not configured", { status: 400 });
  }

  if (!verifyCallbackIp(request, config)) {
    return new NextResponse("invalid callback ip", { status: 403 });
  }

  if (!verifyItxtWebhook(payload, config)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const merOrderTid = payload.merOrderTid?.trim();
  if (!merOrderTid) {
    return new NextResponse("missing merOrderTid", { status: 400 });
  }

  const { data: payment } = await admin
    .from("payments")
    .select("order_id,status")
    .eq("provider", provider)
    .contains("raw", { merOrderTid })
    .maybeSingle();

  if (!payment?.order_id) {
    return new NextResponse("order not found", { status: 404 });
  }

  const result = parseItxtWebhook(payload as Record<string, unknown>);
  result.orderId = payment.order_id;

  await admin
    .from("payments")
    .update({
      raw: payload as never,
      provider_payment_id: payload.tid ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", payment.order_id);

  if (result.status === "paid" && payment.status !== "paid") {
    await fulfillPaidOrder(payment.order_id, payload.tid ?? undefined);
  } else if (result.status === "failed" || result.status === "expired") {
    await admin
      .from("payments")
      .update({ status: result.status })
      .eq("order_id", payment.order_id);
    await admin
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", payment.order_id)
      .neq("status", "paid");
  }

  return new NextResponse("success", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
