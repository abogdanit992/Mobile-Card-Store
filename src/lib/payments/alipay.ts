import type { CreatePaymentParams, CreatePaymentResult } from "./types";

/** Placeholder — connect Alipay OpenAPI when app credentials are ready. */
export async function createAlipayPersonalPayment(
  _params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  throw new Error(
    "Alipay (personal) is not connected yet. Add API keys in Admin → Payments, then deploy the integration.",
  );
}
