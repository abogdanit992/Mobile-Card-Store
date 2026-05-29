import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * PayPal capture happens on the buyer's return (see /payment/return).
 * This endpoint acknowledges PayPal webhook events so retries stop.
 * Signature verification can be added with PayPal webhook verification API.
 */
export async function POST() {
  return NextResponse.json({ ok: true });
}
