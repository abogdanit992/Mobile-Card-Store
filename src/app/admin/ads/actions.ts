"use server";

import { revalidatePath } from "next/cache";
import { requireAdminForAction } from "@/lib/auth/require-admin";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidate() {
  revalidatePath("/admin/ads");
  revalidatePath("/");
}

export async function createAdAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const textEn = read(formData, "text_en");
  if (!textEn) return { ok: false, message: "English text is required." };

  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const payload: Database["public"]["Tables"]["ads"]["Insert"] = {
    text_en: textEn,
    text_zh: read(formData, "text_zh") || null,
    link_url: read(formData, "link_url") || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true,
  };

  const { error } = await supabase.from("ads").insert([payload]);
  if (error) return { ok: false, message: `Failed to create: ${error.message}` };

  revalidate();
  return { ok: true, message: "Ad created." };
}

export async function updateAdAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing ad id." };

  const textEn = read(formData, "text_en");
  if (!textEn) return { ok: false, message: "English text is required." };

  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const update: Database["public"]["Tables"]["ads"]["Update"] = {
    text_en: textEn,
    text_zh: read(formData, "text_zh") || null,
    link_url: read(formData, "link_url") || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  const { error } = await supabase.from("ads").update(update).eq("id", id);
  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidate();
  return { ok: true, message: "Saved." };
}

export async function toggleAdAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";
  if (!id) return { ok: false, message: "Missing ad id." };

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const { error } = await supabase.from("ads").update({ active: nextActive }).eq("id", id);
  if (error) return { ok: false, message: `Failed: ${error.message}` };

  revalidate();
  return { ok: true, message: nextActive ? "Now visible." : "Hidden." };
}

export async function deleteAdAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing ad id." };

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const { error } = await supabase.from("ads").delete().eq("id", id);
  if (error) return { ok: false, message: `Failed to delete: ${error.message}` };

  revalidate();
  return { ok: true, message: "Deleted." };
}
