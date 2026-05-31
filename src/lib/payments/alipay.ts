import { createItxtPayment } from "./itxt-pay";
import type { CreatePaymentParams, CreatePaymentResult } from "./types";

/** Alipay (merchant) via ITXT aggregator API. */
export async function createAlipayPayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  return createItxtPayment(params);
}
