"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateHomeContentAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const heroEnabled = formData.get("home_hero_enabled") === "on";

  const rows: { key: string; value: Json }[] = [
    { key: "home_tagline_en", value: read(formData, "home_tagline_en") as unknown as Json },
    { key: "home_tagline_zh", value: read(formData, "home_tagline_zh") as unknown as Json },
    { key: "home_hero_enabled", value: heroEnabled as unknown as Json },
    { key: "home_hero_eyebrow_en", value: read(formData, "home_hero_eyebrow_en") as unknown as Json },
    { key: "home_hero_eyebrow_zh", value: read(formData, "home_hero_eyebrow_zh") as unknown as Json },
    { key: "home_hero_title_en", value: read(formData, "home_hero_title_en") as unknown as Json },
    { key: "home_hero_title_zh", value: read(formData, "home_hero_title_zh") as unknown as Json },
    { key: "home_hero_desc_en", value: read(formData, "home_hero_desc_en") as unknown as Json },
    { key: "home_hero_desc_zh", value: read(formData, "home_hero_desc_zh") as unknown as Json },
  ];

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_settings").upsert(rows);
  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidatePath("/", "layout");
  revalidatePath("/admin/homepage");
  return { ok: true, message: "Homepage content saved." };
}
