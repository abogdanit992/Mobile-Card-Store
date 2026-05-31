import type { CreatePaymentParams, CreatePaymentResult } from "./types";

/** Placeholder — connect WeChat Pay API when merchant credentials are ready. */
export async function createWechatPersonalPayment(
  _params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  throw new Error(
    "WeChat Pay (personal) is not connected yet. Add API keys in Admin → Payments, then deploy the integration.",
  );
}
