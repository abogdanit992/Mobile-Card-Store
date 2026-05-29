"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createProductAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const nameEn = read(formData, "name_en");
  const nameZh = read(formData, "name_zh");
  const cover = read(formData, "cover");
  const categoryId = read(formData, "category_id");
  const priceRaw = Number(formData.get("price"));

  if (!nameEn || Number.isNaN(priceRaw) || priceRaw < 0) {
    return { ok: false, message: "Invalid product input." };
  }

  const supabase = await createSupabaseServerClient();
  const payload: Database["public"]["Tables"]["products"]["Insert"] = {
    title: nameEn,
    name_en: nameEn,
    name_zh: nameZh || null,
    description_en: read(formData, "description_en") || null,
    description_zh: read(formData, "description_zh") || null,
    cover: cover || null,
    category_id: categoryId || null,
    price: priceRaw,
    active: true,
  };

  const { error } = await supabase.from("products").insert([payload]);
  if (error) return { ok: false, message: `Failed to create: ${error.message}` };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, message: `Created “${nameEn}”.` };
}

export async function updateProductAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing product id." };

  const nameEn = read(formData, "name_en");
  const categoryId = read(formData, "category_id");
  const priceRaw = Number(formData.get("price"));

  if (!nameEn || Number.isNaN(priceRaw) || priceRaw < 0) {
    return { ok: false, message: "Invalid product input." };
  }

  const supabase = await createSupabaseServerClient();
  const update: Database["public"]["Tables"]["products"]["Update"] = {
    title: nameEn,
    name_en: nameEn,
    name_zh: read(formData, "name_zh") || null,
    description_en: read(formData, "description_en") || null,
    description_zh: read(formData, "description_zh") || null,
    cover: read(formData, "cover") || null,
    category_id: categoryId || null,
    price: priceRaw,
  };

  const { error } = await supabase.from("products").update(update).eq("id", id);
  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, message: "Saved." };
}

export async function toggleProductStatusAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";
  if (!id) return { ok: false, message: "Missing product id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) return { ok: false, message: `Failed: ${error.message}` };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, message: nextActive ? "Now active." : "Set inactive." };
}

export async function deleteProductAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing product id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: `Failed to delete: ${error.message}` };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, message: "Deleted." };
}
