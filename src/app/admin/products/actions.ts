"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createProductAction(formData: FormData) {
  const nameEn = read(formData, "name_en");
  const nameZh = read(formData, "name_zh");
  const cover = read(formData, "cover");
  const categoryId = read(formData, "category_id");
  const priceRaw = Number(formData.get("price"));

  if (!nameEn || Number.isNaN(priceRaw) || priceRaw < 0) {
    throw new Error("Invalid product input.");
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
  if (error) throw new Error(`Failed to create product: ${error.message}`);

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProductAction(formData: FormData) {
  const id = read(formData, "id");
  if (!id) throw new Error("Missing product id.");

  const nameEn = read(formData, "name_en");
  const categoryId = read(formData, "category_id");
  const priceRaw = Number(formData.get("price"));

  if (!nameEn || Number.isNaN(priceRaw) || priceRaw < 0) {
    throw new Error("Invalid product input.");
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
  if (error) throw new Error(`Failed to update product: ${error.message}`);

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function toggleProductStatusAction(formData: FormData) {
  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";
  if (!id) throw new Error("Missing product id.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) throw new Error(`Failed to update product: ${error.message}`);

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProductAction(formData: FormData) {
  const id = read(formData, "id");
  if (!id) throw new Error("Missing product id.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);

  revalidatePath("/admin/products");
  revalidatePath("/");
}
