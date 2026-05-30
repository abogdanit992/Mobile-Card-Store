import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_USDT_TRC20_CONTRACT } from "./direct-usdt";
import { fulfillPaidOrder } from "./service";

const TRONGRID_BASE = "https://api.trongrid.io";

export type Trc20Transfer = {
  txId: string;
  amount: number;
  to: string;
  blockTimestamp: number;
};

type TronGridTrc20Item = {
  transaction_id?: string;
  token_info?: { address?: string; decimals?: number };
  block_timestamp?: number;
  from?: string;
  to?: string;
  value?: string;
  type?: string;
};

/** Fetch recent incoming USDT-TRC20 transfers to `walletAddress`. */
export async function fetchIncomingUsdtTransfers(
  walletAddress: string,
  options: {
    contractAddress?: string;
    apiKey?: string;
    minTimestampMs?: number;
    limit?: number;
  } = {},
): Promise<Trc20Transfer[]> {
  const contract = options.contractAddress ?? DEFAULT_USDT_TRC20_CONTRACT;
  const limit = options.limit ?? 50;
  const url = new URL(
    `/v1/accounts/${walletAddress}/transactions/trc20`,
    TRONGRID_BASE,
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("contract_address", contract);
  url.searchParams.set("only_to", "true");
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
    const to = item.to ?? "";
    if (to.toLowerCase() !== walletAddress.toLowerCase()) continue;

    const decimals = item.token_info?.decimals ?? 6;
    const raw = item.value ?? "0";
    const amount = Number(raw) / 10 ** decimals;
    if (!item.transaction_id || amount <= 0) continue;

    out.push({
      txId: item.transaction_id,
      amount: Number(amount.toFixed(6)),
      to,
      blockTimestamp: item.block_timestamp ?? 0,
    });
  }

  return out;
}

/** Mark expired pending direct_usdt orders as cancelled. */
export async function expireStaleOrders() {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: expired } = await admin
    .from("orders")
    .select("id")
    .eq("status", "pending")
    .not("expires_at", "is", null)
    .lt("expires_at", now);

  if (!expired?.length) return 0;

  for (const order of expired) {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    await admin
      .from("payments")
      .update({ status: "expired", updated_at: now })
      .eq("order_id", order.id)
      .eq("status", "pending");
  }

  return expired.length;
}

/**
 * Poll TronGrid and fulfill matching pending direct_usdt orders.
 * Returns count of newly fulfilled orders.
 */
export async function processDirectUsdtPayments(): Promise<{
  fulfilled: number;
  expired: number;
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
  const walletAddress = config.wallet_address?.trim();
  if (!walletAddress) {
    return { fulfilled: 0, expired, error: "wallet_address missing" };
  }

  const contractAddress =
    config.usdt_contract?.trim() || DEFAULT_USDT_TRC20_CONTRACT;
  const apiKey = config.tron_api_key?.trim() || undefined;

  const { data: pendingOrders } = await admin
    .from("orders")
    .select("id,pay_amount_exact,created_at,expires_at")
    .eq("status", "pending")
    .not("pay_amount_exact", "is", null)
    .order("created_at", { ascending: true });

  if (!pendingOrders?.length) {
    return { fulfilled: 0, expired };
  }

  const now = Date.now();
  const activeOrders = pendingOrders.filter(
    (o) => !o.expires_at || new Date(o.expires_at).getTime() > now,
  );
  if (!activeOrders.length) {
    return { fulfilled: 0, expired };
  }

  const minTs = Math.min(
    ...activeOrders.map((o) => new Date(o.created_at).getTime() - 60_000),
  );

  let transfers: Trc20Transfer[];
  try {
    transfers = await fetchIncomingUsdtTransfers(walletAddress, {
      contractAddress,
      apiKey,
      minTimestampMs: minTs,
      limit: 100,
    });
  } catch (err) {
    return {
      fulfilled: 0,
      expired,
      error: err instanceof Error ? err.message : "TronGrid fetch failed",
    };
  }

  if (!transfers.length) {
    return { fulfilled: 0, expired };
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

  const amountToOrder = new Map<number, string>();
  for (const order of activeOrders) {
    if (order.pay_amount_exact != null) {
      amountToOrder.set(Number(order.pay_amount_exact), order.id);
    }
  }

  let fulfilled = 0;

  for (const tx of transfers) {
    if (usedTx.has(tx.txId)) continue;

    const orderId = amountToOrder.get(tx.amount);
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
      amountToOrder.delete(tx.amount);
    }
  }

  return { fulfilled, expired };
}
