"use server";

import { revalidatePath } from "next/cache";
import { requireAdminForAction } from "@/lib/auth/require-admin";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategoryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const nameZh = String(formData.get("name_zh") ?? "").trim();
  const iconUrl = String(formData.get("icon_url") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const stackMonthlyCodes = formData.get("stack_monthly_codes") === "on";

  if (!nameEn) return { ok: false, message: "English name is required." };

  const slug = slugify(slugRaw || nameEn);
  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const payload: Database["public"]["Tables"]["categories"]["Insert"] = {
    slug,
    name_en: nameEn,
    name_zh: nameZh || null,
    icon_url: iconUrl || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true,
    stack_monthly_codes: stackMonthlyCodes,
  };

  const { error } = await supabase.from("categories").insert([payload]);
  if (error) return { ok: false, message: `Failed to create: ${error.message}` };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true, message: `Created “${nameEn}”.` };
}

export async function updateCategoryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing category id." };

  const nameEn = String(formData.get("name_en") ?? "").trim();
  const nameZh = String(formData.get("name_zh") ?? "").trim();
  const iconUrl = String(formData.get("icon_url") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const stackMonthlyCodes = formData.get("stack_monthly_codes") === "on";

  if (!nameEn) return { ok: false, message: "English name is required." };

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const update: Database["public"]["Tables"]["categories"]["Update"] = {
    name_en: nameEn,
    name_zh: nameZh || null,
    icon_url: iconUrl || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    stack_monthly_codes: stackMonthlyCodes,
  };

  const { error } = await supabase.from("categories").update(update).eq("id", id);
  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true, message: "Saved." };
}

export async function toggleCategoryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const nextActive = String(formData.get("nextActive") ?? "") === "true";
  if (!id) return { ok: false, message: "Missing category id." };

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const { error } = await supabase
    .from("categories")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) return { ok: false, message: `Failed: ${error.message}` };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true, message: nextActive ? "Now visible." : "Hidden." };
}

export async function deleteCategoryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing category id." };

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, message: `Failed to delete: ${error.message}` };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true, message: "Deleted." };
}
