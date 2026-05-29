"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createQuickLinkAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const labelEn = read(formData, "label_en");
  const url = read(formData, "url");
  if (!labelEn) return { ok: false, message: "English label is required." };
  if (!url) return { ok: false, message: "URL / path is required." };

  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const supabase = await createSupabaseServerClient();
  const payload: Database["public"]["Tables"]["quick_links"]["Insert"] = {
    label_en: labelEn,
    label_zh: read(formData, "label_zh") || null,
    url,
    is_external: read(formData, "is_external") === "on",
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true,
  };

  const { error } = await supabase.from("quick_links").insert([payload]);
  if (error) return { ok: false, message: `Failed to create: ${error.message}` };

  revalidatePath("/admin/links");
  revalidatePath("/");
  return { ok: true, message: `Created “${labelEn}”.` };
}

export async function updateQuickLinkAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing link id." };

  const labelEn = read(formData, "label_en");
  const url = read(formData, "url");
  if (!labelEn) return { ok: false, message: "English label is required." };
  if (!url) return { ok: false, message: "URL / path is required." };

  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const supabase = await createSupabaseServerClient();
  const update: Database["public"]["Tables"]["quick_links"]["Update"] = {
    label_en: labelEn,
    label_zh: read(formData, "label_zh") || null,
    url,
    is_external: read(formData, "is_external") === "on",
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  const { error } = await supabase.from("quick_links").update(update).eq("id", id);
  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidatePath("/admin/links");
  revalidatePath("/");
  return { ok: true, message: "Saved." };
}

export async function toggleQuickLinkAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";
  if (!id) return { ok: false, message: "Missing link id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("quick_links")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) return { ok: false, message: `Failed: ${error.message}` };

  revalidatePath("/admin/links");
  revalidatePath("/");
  return { ok: true, message: nextActive ? "Now visible." : "Hidden." };
}

export async function deleteQuickLinkAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing link id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("quick_links").delete().eq("id", id);
  if (error) return { ok: false, message: `Failed to delete: ${error.message}` };

  revalidatePath("/admin/links");
  revalidatePath("/");
  return { ok: true, message: "Deleted." };
}
