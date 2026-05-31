/** Official USDT TRC20 on TRON mainnet (Tether). */
export const USDT_TRC20_CONTRACT =
  "TR7NHqjeKQxGTCi8q8ZYs4L8WvaBtxL8t4";

/** @deprecated Use USDT_TRC20_CONTRACT */
export const DEFAULT_USDT_TRC20_CONTRACT = USDT_TRC20_CONTRACT;

const TRON_BASE58_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

export function isValidTronBase58Address(value: string): boolean {
  return TRON_BASE58_RE.test(value.trim());
}

/** Ignore invalid admin input; fall back to the official USDT contract. */
export function resolveUsdtContract(raw?: string | null): string {
  const trimmed = raw?.trim();
  if (trimmed && isValidTronBase58Address(trimmed)) {
    return trimmed;
  }
  return USDT_TRC20_CONTRACT;
}

/** Convert USDT amount to micro-units (6 dp) without float rounding errors. */
export function usdtToMicro(amount: number | string): string {
  const s = String(amount).trim();
  if (!s || s === "null" || s === "undefined") return "0";
  const negative = s.startsWith("-");
  const normalized = negative ? s.slice(1) : s;
  const [whole = "0", fracRaw = ""] = normalized.split(".");
  const frac = fracRaw.padEnd(6, "0").slice(0, 6);
  const micro = BigInt(whole || "0") * BigInt(1_000_000) + BigInt(frac);
  const out = micro.toString();
  return negative ? `-${out}` : out;
}

/** Normalize on-chain token `value` string to 6-decimal micro-units. */
export function rawTokenToMicro(raw: string, decimals: number): string {
  const digits = raw.replace(/\D/g, "") || "0";
  if (decimals === 6) return digits.replace(/^0+/, "") || "0";
  if (decimals < 6) {
    const padded = digits.padStart(decimals + 1, "0");
    const whole = padded.slice(0, padded.length - decimals) || "0";
    const frac = padded.slice(padded.length - decimals).padEnd(6, "0").slice(0, 6);
    return usdtToMicro(`${whole}.${frac}`);
  }
  const trimmed = digits.slice(0, digits.length - (decimals - 6));
  return trimmed.replace(/^0+/, "") || "0";
}

export function microToUsdtAmount(micro: string | number): number {
  const n = typeof micro === "string" ? Number(micro) : micro;
  return Number((n / 1_000_000).toFixed(6));
}

export function isUsdtTransfer(
  tokenInfo: { symbol?: string; address?: string } | undefined,
  contractFilter?: string,
): boolean {
  if (!tokenInfo) return false;
  const symbol = tokenInfo.symbol?.toUpperCase();
  if (symbol === "USDT") return true;
  const addr = tokenInfo.address?.trim();
  if (!addr) return false;
  const expected = resolveUsdtContract(contractFilter);
  return addr.toLowerCase() === expected.toLowerCase();
}
