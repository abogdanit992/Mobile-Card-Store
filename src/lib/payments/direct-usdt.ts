import type { CreatePaymentParams, CreatePaymentResult } from "./types";

/** Official USDT TRC20 contract on TRON mainnet. */
export const DEFAULT_USDT_TRC20_CONTRACT =
  "TR7NHqjeKQxGTCi8q8ZYs4L8WvaBtxL8t4";

const DEFAULT_EXPIRE_MINUTES = 30;

/**
 * Derive a unique 6-decimal USDT amount from the order id.
 * e.g. $12.00 + suffix → 12.037412 USDT
 */
export function computeExactPayAmount(priceUsd: number, orderId: string): number {
  const hex = orderId.replace(/-/g, "").slice(0, 10);
  const hash = Number.parseInt(hex, 16) % 1_000_000;
  const micro = hash / 1_000_000;
  const base = Number(priceUsd.toFixed(2));
  return Number((base + micro).toFixed(6));
}

export function formatExactUsdt(amount: number): string {
  return amount.toFixed(6);
}

export function orderExpiresAt(minutes = DEFAULT_EXPIRE_MINUTES): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function parseExpireMinutes(config: Record<string, string>): number {
  const n = Number.parseInt(config.expire_minutes ?? "", 10);
  return Number.isFinite(n) && n >= 5 && n <= 120 ? n : DEFAULT_EXPIRE_MINUTES;
}

/** No external redirect — buyer lands on our USDT instruction page. */
export function createDirectUsdtPayment(
  params: CreatePaymentParams,
): CreatePaymentResult {
  const wallet = params.config.wallet_address?.trim();
  if (!wallet) {
    throw new Error("Direct USDT is not configured (wallet_address).");
  }

  const origin = new URL(params.successUrl).origin;
  return {
    redirectUrl: `${origin}/payment/usdt?orderId=${params.orderId}`,
  };
}
