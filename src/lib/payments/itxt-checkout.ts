import type { Provider } from "./types";

const GATEWAY_BUSY_PATTERNS = [/拉取异常/i, /请联系客服/i, /频繁/i, /limit/i];

/** User-facing hint when the ITXT gateway rejects CreateOrderPay. */
export function formatGatewayPaymentError(message: string, provider?: Provider): string {
  const isItxt = provider === "wechat" || provider === "alipay";
  if (!isItxt) return message;

  if (GATEWAY_BUSY_PATTERNS.some((p) => p.test(message))) {
    return `${message} — 支付通道可能繁忙或未完成订单过多，请等待 5～10 分钟再试，或联系支付方客服（商户号 M200044）关闭未完成订单。`;
  }

  return message;
}

export function buildItxtRedirectUrl(
  origin: string,
  orderId: string,
  payUrl: string,
  userAgent: string,
): string {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  return isMobile ? payUrl : `${origin}/payment/scan?orderId=${orderId}`;
}
