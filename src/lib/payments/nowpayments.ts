import { createHmac } from "crypto";
import type {
  ChannelConfig,
  CreatePaymentParams,
  CreatePaymentResult,
  WebhookResult,
} from "./types";

const API_BASE = "https://api.nowpayments.io/v1";

/**
 * NOWPayments is a non-custodial gateway: funds are sent straight to the
 * merchant's own wallet, so it generally does not require KYC to receive.
 * We use the hosted "invoice" flow so the buyer can pick any supported coin.
 */
export async function createNowPaymentsPayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  const apiKey = params.config.api_key;
  if (!apiKey) {
    throw new Error("NOWPayments is not configured (api_key).");
  }

  const body = {
    price_amount: Number(params.amount.toFixed(2)),
    price_currency: params.currency.toLowerCase(),
    order_id: params.orderId,
    order_description: params.productName,
    ipn_callback_url: params.callbackUrl,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  };

  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    id?: string | number;
    invoice_url?: string;
    message?: string;
    status?: string;
  };

  if (!res.ok || !json.invoice_url) {
    throw new Error(json.message ?? "NOWPayments invoice creation failed.");
  }

  return {
    redirectUrl: json.invoice_url,
    providerPaymentId: json.id != null ? String(json.id) : undefined,
  };
}

type NowPaymentsWebhook = {
  payment_id?: string | number;
  order_id?: string;
  payment_status?: string;
  [key: string]: unknown;
};

/** Recursively sort object keys (NOWPayments signs the sorted JSON). */
function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = obj[key];
      acc[key] =
        value && typeof value === "object" && !Array.isArray(value)
          ? sortObject(value as Record<string, unknown>)
          : value;
      return acc;
    }, {});
}

/**
 * Verify IPN authenticity: HMAC-SHA512 of the sorted JSON body using the
 * IPN secret must equal the `x-nowpayments-sig` header.
 */
export function verifyNowPaymentsWebhook(
  payload: NowPaymentsWebhook,
  config: ChannelConfig,
  signature: string | null,
): boolean {
  const ipnSecret = config.ipn_secret;
  if (!ipnSecret || !signature) return false;

  const sorted = JSON.stringify(sortObject(payload as Record<string, unknown>));
  const expected = createHmac("sha512", ipnSecret).update(sorted).digest("hex");
  return expected === signature;
}

const PAID_STATUSES = new Set(["finished"]);
const FAIL_STATUSES = new Set(["failed", "refunded"]);

export function parseNowPaymentsWebhook(payload: NowPaymentsWebhook): WebhookResult {
  const status = String(payload.payment_status ?? "");
  let mapped: WebhookResult["status"] = "pending";
  if (PAID_STATUSES.has(status)) mapped = "paid";
  else if (FAIL_STATUSES.has(status)) mapped = "failed";
  else if (status === "expired") mapped = "expired";

  return {
    providerPaymentId: payload.payment_id != null ? String(payload.payment_id) : null,
    orderId: payload.order_id ?? null,
    status: mapped,
  };
}
