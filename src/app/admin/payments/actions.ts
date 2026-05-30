"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

const CONFIG_KEYS: Record<string, string[]> = {
  cryptomus: ["merchant_id", "payment_api_key"],
  nowpayments: ["api_key", "ipn_secret"],
  stripe: ["secret_key", "webhook_secret"],
  paypal: ["client_id", "client_secret", "mode"],
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

  const config: Record<string, string> = {};
  for (const key of CONFIG_KEYS[provider] ?? []) {
    const val = read(formData, `config_${key}`);
    if (val) config[key] = val;
  }

  const supabase = await createSupabaseServerClient();
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
