import { createHash } from "crypto";
import type {
  ChannelConfig,
  CreatePaymentParams,
  CreatePaymentResult,
  WebhookResult,
} from "./types";

const API_BASE = "https://api.cryptomus.com/v1";

function md5(input: string) {
  return createHash("md5").update(input).digest("hex");
}

/** Cryptomus sign = md5(base64(jsonBody) + apiKey). */
function sign(payload: unknown, apiKey: string) {
  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  return md5(base64 + apiKey);
}

export async function createCryptomusPayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  const merchant = params.config.merchant_id;
  const apiKey = params.config.payment_api_key;
  if (!merchant || !apiKey) {
    throw new Error("Cryptomus is not configured (merchant_id / payment_api_key).");
  }

  const body = {
    amount: params.amount.toFixed(2),
    currency: params.currency,
    order_id: params.orderId,
    url_callback: params.callbackUrl,
    url_success: params.successUrl,
    url_return: params.cancelUrl,
    lifetime: 3600,
  };

  const res = await fetch(`${API_BASE}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      merchant,
      sign: sign(body, apiKey),
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    state?: number;
    result?: { uuid?: string; url?: string };
    message?: string;
  };

  if (!res.ok || json.state !== 0 || !json.result?.url) {
    throw new Error(json.message ?? "Cryptomus payment creation failed.");
  }

  return {
    redirectUrl: json.result.url,
    providerPaymentId: json.result.uuid,
  };
}

type CryptomusWebhook = {
  uuid?: string;
  order_id?: string;
  status?: string;
  sign?: string;
  [key: string]: unknown;
};

/** Verify webhook signature: md5(base64(payloadWithoutSign) + apiKey) === sign. */
export function verifyCryptomusWebhook(
  payload: CryptomusWebhook,
  config: ChannelConfig,
): boolean {
  const apiKey = config.payment_api_key;
  if (!apiKey || !payload.sign) return false;

  const { sign: incoming, ...rest } = payload;
  const expected = sign(rest, apiKey);
  return expected === incoming;
}

const PAID_STATUSES = new Set(["paid", "paid_over"]);
const FAIL_STATUSES = new Set(["fail", "cancel", "system_fail", "refund_fail"]);

export function parseCryptomusWebhook(payload: CryptomusWebhook): WebhookResult {
  const status = String(payload.status ?? "");
  let mapped: WebhookResult["status"] = "pending";
  if (PAID_STATUSES.has(status)) mapped = "paid";
  else if (FAIL_STATUSES.has(status)) mapped = "failed";
  else if (status === "expired" || status === "wrong_amount") mapped = "expired";

  return {
    providerPaymentId: payload.uuid ?? null,
    orderId: payload.order_id ?? null,
    status: mapped,
  };
}
