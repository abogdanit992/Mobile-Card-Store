import type { Provider } from "./types";

const CNY_PROVIDERS = new Set<Provider>(["wechat", "alipay"]);

export function isCnyCheckoutProvider(provider: Provider): boolean {
  return CNY_PROVIDERS.has(provider);
}

export function parseExchangeRate(raw: string | undefined | null): number | null {
  const rate = Number(String(raw ?? "").trim());
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

/** Convert USD storefront price to CNY using admin exchange_rate. */
export function convertUsdToCny(
  usd: number,
  rateRaw: string | undefined | null,
): number {
  const rate = parseExchangeRate(rateRaw);
  if (!rate) return usd;
  return Math.round(usd * rate * 100) / 100;
}

export function formatCnyPrice(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function requireCnyAmount(
  usd: number,
  config: Record<string, string | undefined>,
): string {
  const rate = parseExchangeRate(config.exchange_rate);
  if (!rate) {
    throw new Error(
      "WeChat/Alipay requires USD→CNY exchange_rate in Admin → Payments.",
    );
  }
  return convertUsdToCny(usd, String(rate)).toFixed(2);
}
