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

/** Convert a USDT float amount to integer micro-units (6 decimals) for exact matching. */
export function usdtToMicro(amount: number | string): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n * 1_000_000));
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
