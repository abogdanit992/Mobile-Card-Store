"use server";

import { revalidatePath } from "next/cache";
import { requireAdminForAction } from "@/lib/auth/require-admin";
import type { Json } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

const SECRET_CONFIG_KEYS = new Set([
  "merchant_secret",
  "payment_api_key",
  "api_key",
  "ipn_secret",
  "secret_key",
  "webhook_secret",
  "client_secret",
  "private_key",
  "api_v3_key",
  "tron_api_key",
]);

const CONFIG_KEYS: Record<string, string[]> = {
  cryptomus: ["merchant_id", "payment_api_key"],
  nowpayments: ["api_key", "ipn_secret"],
  stripe: ["secret_key", "webhook_secret", "publishable_key"],
  wechat: [
    "mid",
    "merchant_secret",
    "api_base_url",
    "channel_code",
    "exchange_rate",
    "callback_ips",
  ],
  alipay: [
    "mid",
    "merchant_secret",
    "api_base_url",
    "channel_code",
    "exchange_rate",
    "callback_ips",
  ],
  paypal_personal: ["client_id", "client_secret", "mode", "account_email"],
  paypal_business: [
    "client_id",
    "client_secret",
    "mode",
    "business_email",
    "webhook_id",
  ],
  paypal: ["client_id", "client_secret", "mode"],
  direct_usdt: ["wallet_address", "tron_api_key", "usdt_contract", "expire_minutes"],
};

export async function updatePaymentChannelAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  const provider = read(formData, "provider");
  if (!id || !provider) {
    return { ok: false, message: "Missing channel id/provider." };
  }

  const labelEn = read(formData, "label_en");
  const labelZh = read(formData, "label_zh");
  const enabled = read(formData, "enabled") === "on";
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;

  const { data: existingRow } = await supabase
    .from("payment_channels")
    .select("config")
    .eq("id", id)
    .maybeSingle();

  const prev =
    existingRow?.config && typeof existingRow.config === "object"
      ? (existingRow.config as Record<string, string>)
      : {};

  const config: Record<string, string> = { ...prev };
  for (const key of CONFIG_KEYS[provider] ?? []) {
    const val = read(formData, `config_${key}`);
    if (val) {
      config[key] = val;
    } else if (SECRET_CONFIG_KEYS.has(key) && prev[key]) {
      config[key] = prev[key];
    } else if (!SECRET_CONFIG_KEYS.has(key)) {
      delete config[key];
    }
  }

  const { error } = await supabase
    .from("payment_channels")
    .update({
      label_en: labelEn || provider,
      label_zh: labelZh || null,
      enabled,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      config: config as Json,
    })
    .eq("id", id);

  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidatePath("/admin/payments");
  revalidatePath("/checkout");
  return {
    ok: true,
    message: enabled ? "Saved — channel enabled." : "Saved — channel disabled.",
  };
}
