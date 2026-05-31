export type Provider =
  | "cryptomus"
  | "nowpayments"
  | "stripe"
  | "paypal"
  | "paypal_personal"
  | "paypal_business"
  | "direct_usdt"
  | "wechat_personal"
  | "alipay_personal";

export const ALL_PROVIDERS: readonly Provider[] = [
  "cryptomus",
  "nowpayments",
  "stripe",
  "paypal",
  "paypal_personal",
  "paypal_business",
  "direct_usdt",
  "wechat_personal",
  "alipay_personal",
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
};

export type CreatePaymentResult = {
  /** URL to redirect the buyer to complete payment. */
  redirectUrl: string;
  /** Provider-side payment/invoice id, if available immediately. */
  providerPaymentId?: string;
};

export type WebhookResult = {
  providerPaymentId: string | null;
  orderId: string | null;
  status: "paid" | "failed" | "expired" | "cancelled" | "pending";
};
