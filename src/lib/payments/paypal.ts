import type {
  ChannelConfig,
  CreatePaymentParams,
  CreatePaymentResult,
  WebhookResult,
} from "./types";

function apiBase(config: ChannelConfig) {
  return config.mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken(config: ChannelConfig): Promise<string> {
  const clientId = config.client_id;
  const clientSecret = config.client_secret;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured (client_id / client_secret).");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${apiBase(config)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const json = (await res.json()) as { access_token?: string; error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description ?? "PayPal auth failed.");
  }
  return json.access_token;
}

export async function createPaypalPayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  const token = await getAccessToken(params.config);

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: params.orderId,
        amount: {
          currency_code: params.currency,
          value: params.amount.toFixed(2),
        },
        description: params.productName,
      },
    ],
    application_context: {
      return_url: params.successUrl,
      cancel_url: params.cancelUrl,
      user_action: "PAY_NOW",
    },
  };

  const res = await fetch(`${apiBase(params.config)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    id?: string;
    links?: { rel: string; href: string }[];
    message?: string;
  };

  const approve = json.links?.find((l) => l.rel === "approve")?.href;
  if (!res.ok || !approve) {
    throw new Error(json.message ?? "PayPal order creation failed.");
  }

  return { redirectUrl: approve, providerPaymentId: json.id };
}

/** Capture a PayPal order after buyer approval (used on return/webhook). */
export async function capturePaypalOrder(
  config: ChannelConfig,
  paypalOrderId: string,
): Promise<WebhookResult> {
  const token = await getAccessToken(config);
  const res = await fetch(
    `${apiBase(config)}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const json = (await res.json()) as {
    status?: string;
    purchase_units?: { custom_id?: string }[];
  };

  const orderId = json.purchase_units?.[0]?.custom_id ?? null;
  const status: WebhookResult["status"] =
    json.status === "COMPLETED" ? "paid" : "pending";

  return { providerPaymentId: paypalOrderId, orderId, status };
}
