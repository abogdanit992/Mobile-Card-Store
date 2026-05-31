import { createItxtPayment } from "./itxt-pay";
import type { CreatePaymentParams, CreatePaymentResult } from "./types";

/** WeChat Pay (merchant) via ITXT aggregator API. */
export async function createWechatPayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  return createItxtPayment(params);
}
