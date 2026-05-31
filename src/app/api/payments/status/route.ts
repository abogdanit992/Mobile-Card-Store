import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { processDirectUsdtPayments } from "@/lib/payments/tron-watch";
import {
  checkRateLimit,
  clientIpFromHeaders,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";

/** Poll order status; triggers chain check for pending direct_usdt orders. */
export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const allowed = await checkRateLimit({
    bucket: `pay-status:${ip}`,
    max: 60,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id,status,expires_at,pay_amount_exact")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ status: "paid", orderId: order.id });
  }

  if (
    order.expires_at &&
    new Date(order.expires_at).getTime() < Date.now()
  ) {
    return NextResponse.json({ status: "expired", orderId: order.id });
  }

  const { data: payment } = await admin
    .from("payments")
    .select("provider,status")
    .eq("order_id", orderId)
    .maybeSingle();

  if (payment?.provider === "direct_usdt" && payment.status === "pending") {
    await processDirectUsdtPayments();
  }

  const { data: refreshed } = await admin
    .from("orders")
    .select("status,expires_at")
    .eq("id", orderId)
    .maybeSingle();

  if (refreshed?.status === "paid") {
    return NextResponse.json({ status: "paid", orderId: order.id });
  }

  if (
    refreshed?.expires_at &&
    new Date(refreshed.expires_at).getTime() < Date.now()
  ) {
    return NextResponse.json({ status: "expired", orderId: order.id });
  }

  return NextResponse.json({
    status: "pending",
    orderId: order.id,
    payAmountExact: order.pay_amount_exact,
  });
}
