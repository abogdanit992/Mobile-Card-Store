"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createPlatformAction(formData: FormData) {
  const nameEn = read(formData, "name_en");
  if (!nameEn) throw new Error("English name is required.");

  const categoryId = read(formData, "category_id");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  const supabase = await createSupabaseServerClient();
  const payload: Database["public"]["Tables"]["platform_downloads"]["Insert"] = {
    name_en: nameEn,
    name_zh: read(formData, "name_zh") || null,
    logo_url: read(formData, "logo_url") || null,
    android_url: read(formData, "android_url") || null,
    ios_url: read(formData, "ios_url") || null,
    cloud_url: read(formData, "cloud_url") || null,
    download_page: read(formData, "download_page") || null,
    category_id: categoryId || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true,
  };

  const { error } = await supabase.from("platform_downloads").insert([payload]);
  if (error) throw new Error(`Failed to create platform: ${error.message}`);

  revalidatePath("/admin/platforms");
  revalidatePath("/download");
}

export async function updatePlatformAction(formData: FormData) {
  const id = read(formData, "id");
  if (!id) throw new Error("Missing platform id.");

  const nameEn = read(formData, "name_en");
  if (!nameEn) throw new Error("English name is required.");

  const categoryId = read(formData, "category_id");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  const supabase = await createSupabaseServerClient();
  const update: Database["public"]["Tables"]["platform_downloads"]["Update"] = {
    name_en: nameEn,
    name_zh: read(formData, "name_zh") || null,
    logo_url: read(formData, "logo_url") || null,
    android_url: read(formData, "android_url") || null,
    ios_url: read(formData, "ios_url") || null,
    cloud_url: read(formData, "cloud_url") || null,
    download_page: read(formData, "download_page") || null,
    category_id: categoryId || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  const { error } = await supabase
    .from("platform_downloads")
    .update(update)
    .eq("id", id);
  if (error) throw new Error(`Failed to update platform: ${error.message}`);

  revalidatePath("/admin/platforms");
  revalidatePath("/download");
}

export async function togglePlatformAction(formData: FormData) {
  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";
  if (!id) throw new Error("Missing platform id.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("platform_downloads")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) throw new Error(`Failed to update platform: ${error.message}`);

  revalidatePath("/admin/platforms");
  revalidatePath("/download");
}

export async function deletePlatformAction(formData: FormData) {
  const id = read(formData, "id");
  if (!id) throw new Error("Missing platform id.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("platform_downloads").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete platform: ${error.message}`);

  revalidatePath("/admin/platforms");
  revalidatePath("/download");
}
