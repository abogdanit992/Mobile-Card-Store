"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategoryAction(formData: FormData) {
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const nameZh = String(formData.get("name_zh") ?? "").trim();
  const iconUrl = String(formData.get("icon_url") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!nameEn) throw new Error("English name is required.");

  const slug = slugify(slugRaw || nameEn);
  const supabase = await createSupabaseServerClient();
  const payload: Database["public"]["Tables"]["categories"]["Insert"] = {
    slug,
    name_en: nameEn,
    name_zh: nameZh || null,
    icon_url: iconUrl || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true,
  };

  const { error } = await supabase.from("categories").insert([payload]);
  if (error) throw new Error(`Failed to create category: ${error.message}`);

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing category id.");

  const nameEn = String(formData.get("name_en") ?? "").trim();
  const nameZh = String(formData.get("name_zh") ?? "").trim();
  const iconUrl = String(formData.get("icon_url") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!nameEn) throw new Error("English name is required.");

  const supabase = await createSupabaseServerClient();
  const update: Database["public"]["Tables"]["categories"]["Update"] = {
    name_en: nameEn,
    name_zh: nameZh || null,
    icon_url: iconUrl || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  const { error } = await supabase.from("categories").update(update).eq("id", id);
  if (error) throw new Error(`Failed to update category: ${error.message}`);

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function toggleCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nextActive = String(formData.get("nextActive") ?? "") === "true";
  if (!id) throw new Error("Missing category id.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("categories")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) throw new Error(`Failed to update category: ${error.message}`);

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing category id.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete category: ${error.message}`);

  revalidatePath("/admin/categories");
  revalidatePath("/");
}
