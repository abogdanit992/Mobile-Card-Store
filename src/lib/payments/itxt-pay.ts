import { createHash } from "crypto";
import { requireCnyAmount } from "./exchange-rate";
import type {
  ChannelConfig,
  CreatePaymentParams,
  CreatePaymentResult,
  WebhookResult,
} from "./types";

const DEFAULT_API_BASE = "http://RfBseViEKZlMAmu7ArWO.itxt002.xyz";

type ItxtApiResponse<T> = {
  status: number;
  errMsg: string | null;
  result: T | null;
};

type CreateOrderResult = {
  tid: string;
  merOrderTid: string;
  payUrl: string | null;
  payOrderStatus: number;
  money: number;
};

type QueryOrderResult = {
  tid: string;
  merOrderTid: string;
  payUrl: string | null;
  payOrderStatus: number;
  money: number;
};

/** merOrderTid max 30 chars; UUID without dashes is 32 — trim to fit. */
export function buildMerOrderTid(paymentId: string): string {
  const compact = paymentId.replace(/-/g, "");
  return compact.slice(0, 30);
}

function md5(input: string): string {
  return createHash("md5").update(input, "utf8").digest("hex").toUpperCase();
}

/**
 * Sign: sort non-empty params by key (ASCII), join key=value&…, append Secret, MD5.
 * @see vendor API docs
 */
export function buildItxtSign(
  params: Record<string, string | number | null | undefined>,
  secret: string,
): string {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);

  return md5(`${pairs.join("&")}&${secret}`);
}

export function verifyItxtSign(
  params: Record<string, string | number | null | undefined>,
  secret: string,
  incomingSign: string,
): boolean {
  if (!incomingSign) return false;
  const expected = buildItxtSign(params, secret);
  return expected.toUpperCase() === incomingSign.toUpperCase();
}

function apiBase(config: ChannelConfig): string {
  return (config.api_base_url?.trim() || DEFAULT_API_BASE).replace(/\/$/, "");
}

async function postForm<T>(
  url: string,
  body: Record<string, string>,
): Promise<ItxtApiResponse<T>> {
  const form = new URLSearchParams(body);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const json = (await res.json()) as ItxtApiResponse<T>;
  if (!res.ok) {
    throw new Error(json.errMsg ?? `Gateway HTTP ${res.status}`);
  }
  return json;
}

function requireConfig(config: ChannelConfig) {
  const mid = config.mid?.trim();
  const secret = config.merchant_secret?.trim();
  const channelCode = config.channel_code?.trim();
  if (!mid || !secret) {
    throw new Error("Payment gateway not configured (mid / merchant_secret).");
  }
  if (!channelCode) {
    throw new Error("Payment gateway channel_code is not configured.");
  }
  return { mid, secret, channelCode };
}

export async function createItxtPayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  const { mid, secret, channelCode } = requireConfig(params.config);
  const merOrderTid = buildMerOrderTid(params.paymentId);
  const money = requireCnyAmount(params.amount, params.config);

  const orderFields: Record<string, string> = {
    mid,
    merOrderTid,
    money,
    channelCode,
    notifyUrl: params.callbackUrl,
    returnUrl: params.successUrl,
  };

  if (params.clientIp) {
    orderFields.clientIp = params.clientIp;
  }

  const sign = buildItxtSign(orderFields, secret);

  const json = await postForm<CreateOrderResult>(
    `${apiBase(params.config)}/api/services/app/Api_PayOrder/CreateOrderPay`,
    { ...orderFields, sign },
  );

  if (json.status !== 0 || !json.result) {
    throw new Error(json.errMsg ?? "Create order failed.");
  }

  const payUrl = json.result.payUrl?.trim();
  if (!payUrl) {
    throw new Error("Gateway did not return a payment URL.");
  }

  return {
    redirectUrl: payUrl,
    providerPaymentId: json.result.tid,
    merchantOrderId: merOrderTid,
    paymentPageUrl: payUrl,
  };
}

export async function queryItxtPayment(
  config: ChannelConfig,
  merOrderTid: string,
): Promise<QueryOrderResult | null> {
  const mid = config.mid?.trim();
  const secret = config.merchant_secret?.trim();
  if (!mid || !secret) return null;

  const fields = { mid, merOrderTid };
  const sign = buildItxtSign(fields, secret);

  const json = await postForm<QueryOrderResult>(
    `${apiBase(config)}/api/services/app/Api_PayOrder/QueryPayOrder`,
    { ...fields, sign },
  );

  if (json.status !== 0 || !json.result) return null;
  return json.result;
}

const STATUS_MAP: Record<number, WebhookResult["status"]> = {
  0: "pending",
  1: "paid",
  2: "failed",
  3: "failed",
  4: "expired",
};

export function parseItxtWebhook(payload: Record<string, unknown>): WebhookResult {
  const statusNum = Number(payload.status);
  const mapped = STATUS_MAP[statusNum] ?? "pending";

  return {
    providerPaymentId: typeof payload.tid === "string" ? payload.tid : null,
    orderId: null,
    status: mapped,
  };
}

export type ItxtWebhookPayload = {
  merOrderTid?: string;
  tid?: string;
  money?: string;
  status?: number;
  sign?: string;
  clientUserPayRemark?: string;
};

export function verifyItxtWebhook(
  payload: ItxtWebhookPayload,
  config: ChannelConfig,
): boolean {
  const secret = config.merchant_secret?.trim();
  if (!secret || !payload.sign) return false;

  const { sign: incoming, ...rest } = payload;
  return verifyItxtSign(rest, secret, incoming);
}
