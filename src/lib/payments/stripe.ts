import { createHmac, timingSafeEqual } from "crypto";
import type {
  ChannelConfig,
  CreatePaymentParams,
  CreatePaymentResult,
  WebhookResult,
} from "./types";

const API_BASE = "https://api.stripe.com/v1";

export async function createStripePayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  const secretKey = params.config.secret_key;
  if (!secretKey) {
    throw new Error("Stripe is not configured (secret_key).");
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", params.successUrl);
  form.set("cancel_url", params.cancelUrl);
  form.set("client_reference_id", params.orderId);
  if (params.contactEmail) {
    form.set("customer_email", params.contactEmail);
  }
  form.set("metadata[order_id]", params.orderId);
  form.set("metadata[payment_id]", params.paymentId);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", params.currency.toLowerCase());
  form.set("line_items[0][price_data][product_data][name]", params.productName);
  form.set(
    "line_items[0][price_data][unit_amount]",
    String(Math.round(params.amount * 100)),
  );

  const res = await fetch(`${API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const json = (await res.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!res.ok || !json.url) {
    throw new Error(json.error?.message ?? "Stripe session creation failed.");
  }

  return { redirectUrl: json.url, providerPaymentId: json.id };
}

/** Verify Stripe webhook signature (t + v1 scheme). */
export function verifyStripeWebhook(
  rawBody: string,
  signatureHeader: string | null,
  config: ChannelConfig,
): boolean {
  const secret = config.webhook_secret;
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k, v];
    }),
  );
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

type StripeEvent = {
  type?: string;
  data?: { object?: Record<string, unknown> };
};

export function parseStripeWebhook(event: StripeEvent): WebhookResult {
  const obj = event.data?.object ?? {};
  const orderId =
    (obj.client_reference_id as string | undefined) ??
    ((obj.metadata as Record<string, string> | undefined)?.order_id ?? null);
  const providerPaymentId = (obj.id as string | undefined) ?? null;

  let status: WebhookResult["status"] = "pending";
  if (event.type === "checkout.session.completed") {
    const paymentStatus = obj.payment_status as string | undefined;
    status = paymentStatus === "paid" ? "paid" : "pending";
  } else if (event.type === "checkout.session.expired") {
    status = "expired";
  } else if (event.type === "checkout.session.async_payment_failed") {
    status = "failed";
  }

  return { providerPaymentId, orderId, status };
}
