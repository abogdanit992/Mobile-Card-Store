"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/lib/i18n/config";
import type { Json } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

export async function updateLanguageSettingsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const enableEn = formData.get("enable_en") === "on";
  const enableZh = formData.get("enable_zh") === "on";
  const defaultLang = String(formData.get("default_language") ?? "en");

  const enabled: Locale[] = [];
  if (enableEn) enabled.push("en");
  if (enableZh) enabled.push("zh");
  if (enabled.length === 0) enabled.push("en");

  const def: Locale = isLocale(defaultLang) && enabled.includes(defaultLang)
    ? defaultLang
    : enabled[0];

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_settings").upsert([
    { key: "enabled_languages", value: enabled as unknown as Json },
    { key: "default_language", value: def as unknown as Json },
  ]);

  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Settings saved." };
}
