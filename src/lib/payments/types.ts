export type Provider =
  | "cryptomus"
  | "nowpayments"
  | "stripe"
  | "paypal"
  | "paypal_personal"
  | "paypal_business"
  | "direct_usdt"
  | "wechat"
  | "alipay";

export const ALL_PROVIDERS: readonly Provider[] = [
  "cryptomus",
  "nowpayments",
  "stripe",
  "paypal",
  "paypal_personal",
  "paypal_business",
  "direct_usdt",
  "wechat",
  "alipay",
];

export type ChannelConfig = Record<string, string>;

export type CreatePaymentParams = {
  provider: Provider;
  config: ChannelConfig;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  productName: string;
  contactEmail: string;
  successUrl: string;
  cancelUrl: string;
  callbackUrl: string;
  /** Buyer IP forwarded from checkout (optional gateway field). */
  clientIp?: string;
};

export type WebhookResult = {
  providerPaymentId: string | null;
  orderId: string | null;
  status: "paid" | "failed" | "expired" | "cancelled" | "pending";
};

export type CreatePaymentResult = {
  /** URL to redirect the buyer to complete payment. */
  redirectUrl: string;
  /** Provider-side payment/invoice id, if available immediately. */
  providerPaymentId?: string;
  /** Gateway merchant order id (merOrderTid) for async lookup. */
  merchantOrderId?: string;
  /** External gateway H5 URL (Alipay / WeChat); stored for QR on desktop. */
  paymentPageUrl?: string;
};
