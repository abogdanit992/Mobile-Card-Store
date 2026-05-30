import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isUsdtTransfer,
  isValidTronBase58Address,
  microToUsdtAmount,
  resolveUsdtContract,
  usdtToMicro,
} from "./tron-utils";
import { fulfillPaidOrder } from "./service";

const TRONGRID_BASE = "https://api.trongrid.io";

export type Trc20Transfer = {
  txId: string;
  amountMicro: string;
  amount: number;
  to: string;
  blockTimestamp: number;
};

type TronGridTrc20Item = {
  transaction_id?: string;
  token_info?: { symbol?: string; address?: string; decimals?: number };
  block_timestamp?: number;
  from?: string;
  to?: string;
  value?: string;
  type?: string;
};

/** Fetch recent incoming USDT-TRC20 transfers (no contract_address filter — TronGrid rejects it). */
export async function fetchIncomingUsdtTransfers(
  walletAddress: string,
  options: {
    contractAddress?: string;
    apiKey?: string;
    minTimestampMs?: number;
    limit?: number;
  } = {},
): Promise<Trc20Transfer[]> {
  if (!isValidTronBase58Address(walletAddress)) {
    throw new Error(`Invalid TRON wallet address: ${walletAddress}`);
  }

  const contractFilter = resolveUsdtContract(options.contractAddress);
  const limit = Math.min(options.limit ?? 50, 200);
  const url = new URL(
    `/v1/accounts/${walletAddress.trim()}/transactions/trc20`,
    TRONGRID_BASE,
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("only_to", "true");
  url.searchParams.set("only_confirmed", "true");
  if (options.minTimestampMs) {
    url.searchParams.set("min_timestamp", String(options.minTimestampMs));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.apiKey) {
    headers["TRON-PRO-API-KEY"] = options.apiKey;
  }

  const res = await fetch(url.toString(), { headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TronGrid error ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { data?: TronGridTrc20Item[] };
  const out: Trc20Transfer[] = [];

  for (const item of json.data ?? []) {
    if (item.type && item.type !== "Transfer") continue;
    if (!isUsdtTransfer(item.token_info, contractFilter)) continue;

    const to = item.to ?? "";
    if (to.toLowerCase() !== walletAddress.trim().toLowerCase()) continue;

    const decimals = item.token_info?.decimals ?? 6;
    const raw = item.value ?? "0";
    const amount = microToUsdtAmount(Number(raw) / 10 ** decimals);
    if (!item.transaction_id || amount <= 0) continue;

    out.push({
      txId: item.transaction_id,
      amountMicro: usdtToMicro(amount),
      amount,
      to,
      blockTimestamp: item.block_timestamp ?? 0,
    });
  }

  return out;
}

export async function expireStaleOrders() {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: expiredOrders } = await admin
    .from("orders")
    .select("id")
    .eq("status", "pending")
    .not("expires_at", "is", null)
    .lt("expires_at", now);

  if (!expiredOrders?.length) return 0;

  for (const order of expiredOrders) {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
  }

  return expiredOrders.length;
}

type PendingOrderRow = {
  id: string;
  pay_amount_exact: number | null;
  created_at: string;
  expires_at: string | null;
  status: string;
};

export async function processDirectUsdtPayments(): Promise<{
  fulfilled: number;
  expired: number;
  scanned?: number;
  pending?: number;
  error?: string;
}> {
  const admin = createSupabaseAdminClient();

  const expired = await expireStaleOrders();

  const { data: channel } = await admin
    .from("payment_channels")
    .select("config,enabled")
    .eq("provider", "direct_usdt")
    .maybeSingle();

  if (!channel?.enabled) {
    return { fulfilled: 0, expired, error: "direct_usdt disabled" };
  }

  const config = (channel.config ?? {}) as Record<string, string>;
  const walletAddress = config.wallet_address?.trim() ?? "";
  if (!walletAddress) {
    return { fulfilled: 0, expired, error: "wallet_address missing" };
  }
  if (!isValidTronBase58Address(walletAddress)) {
    return {
      fulfilled: 0,
      expired,
      error: `wallet_address invalid (must be T… base58): ${walletAddress}`,
    };
  }

  const contractAddress = resolveUsdtContract(config.usdt_contract);
  const apiKey = config.tron_api_key?.trim() || undefined;

  const { data: pendingPayments } = await admin
    .from("payments")
    .select("order_id")
    .eq("provider", "direct_usdt")
    .in("status", ["pending", "expired"]);

  const orderIds = (pendingPayments ?? [])
    .map((p) => p.order_id)
    .filter((id): id is string => Boolean(id));
  if (!orderIds.length) {
    return { fulfilled: 0, expired, pending: 0 };
  }

  const { data: pendingOrders } = await admin
    .from("orders")
    .select("id,pay_amount_exact,created_at,expires_at,status")
    .in("id", orderIds)
    .not("pay_amount_exact", "is", null);

  if (!pendingOrders?.length) {
    return { fulfilled: 0, expired, pending: 0 };
  }

  const now = Date.now();
  const matchableOrders = pendingOrders.filter((o) => {
    if (!o.expires_at) return true;
    return new Date(o.expires_at).getTime() + 2 * 60 * 60_000 > now;
  });

  if (!matchableOrders.length) {
    return { fulfilled: 0, expired, pending: pendingOrders.length };
  }

  const minTs = Math.min(
    ...matchableOrders.map((o) => new Date(o.created_at).getTime() - 120_000),
  );

  let transfers: Trc20Transfer[];
  try {
    transfers = await fetchIncomingUsdtTransfers(walletAddress, {
      contractAddress,
      apiKey,
      minTimestampMs: minTs,
      limit: 200,
    });
  } catch (err) {
    return {
      fulfilled: 0,
      expired,
      pending: pendingOrders.length,
      error: err instanceof Error ? err.message : "TronGrid fetch failed",
    };
  }

  const { data: usedTxRows } = await admin
    .from("payments")
    .select("provider_payment_id")
    .eq("provider", "direct_usdt")
    .not("provider_payment_id", "is", null);

  const usedTx = new Set(
    (usedTxRows ?? [])
      .map((r) => r.provider_payment_id)
      .filter((id): id is string => Boolean(id)),
  );

  const amountToOrder = new Map<string, string>();
  for (const order of matchableOrders) {
    if (order.pay_amount_exact != null) {
      amountToOrder.set(usdtToMicro(order.pay_amount_exact), order.id);
    }
  }

  let fulfilled = 0;

  for (const tx of transfers) {
    if (usedTx.has(tx.txId)) continue;

    const orderId = amountToOrder.get(tx.amountMicro);
    if (!orderId) continue;

    const { data: payment } = await admin
      .from("payments")
      .select("id,status")
      .eq("order_id", orderId)
      .eq("provider", "direct_usdt")
      .maybeSingle();

    if (!payment || payment.status === "paid") continue;

    await admin
      .from("payments")
      .update({
        provider_payment_id: tx.txId,
        raw: { tron: tx } as never,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    const result = await fulfillPaidOrder(orderId, tx.txId);
    if (result.ok) {
      fulfilled += 1;
      usedTx.add(tx.txId);
      amountToOrder.delete(tx.amountMicro);
    }
  }

  return {
    fulfilled,
    expired,
    scanned: transfers.length,
    pending: pendingOrders.length,
  };
}
