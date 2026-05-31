"use server";

import { revalidatePath } from "next/cache";
import { requireAdminForAction } from "@/lib/auth/require-admin";
import { uploadImageFile } from "@/lib/storage";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createPlatformAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const nameEn = read(formData, "name_en");
  if (!nameEn) return { ok: false, message: "English name is required." };

  const categoryId = read(formData, "category_id");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  let logoUrl = read(formData, "logo_url") || null;
  try {
    const uploaded = await uploadImageFile(formData.get("logo_file"), "platforms");
    if (uploaded) logoUrl = uploaded;
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const payload: Database["public"]["Tables"]["platform_downloads"]["Insert"] = {
    name_en: nameEn,
    name_zh: read(formData, "name_zh") || null,
    logo_url: logoUrl,
    android_url: read(formData, "android_url") || null,
    ios_url: read(formData, "ios_url") || null,
    cloud_url: read(formData, "cloud_url") || null,
    download_page: read(formData, "download_page") || null,
    category_id: categoryId || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true,
  };

  const { error } = await supabase.from("platform_downloads").insert([payload]);
  if (error) return { ok: false, message: `Failed to create: ${error.message}` };

  revalidatePath("/admin/platforms");
  revalidatePath("/download");
  return { ok: true, message: `Created “${nameEn}”.` };
}

export async function updatePlatformAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing platform id." };

  const nameEn = read(formData, "name_en");
  if (!nameEn) return { ok: false, message: "English name is required." };

  const categoryId = read(formData, "category_id");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  let logoUrl = read(formData, "logo_url") || null;
  try {
    const uploaded = await uploadImageFile(formData.get("logo_file"), "platforms");
    if (uploaded) logoUrl = uploaded;
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const update: Database["public"]["Tables"]["platform_downloads"]["Update"] = {
    name_en: nameEn,
    name_zh: read(formData, "name_zh") || null,
    logo_url: logoUrl,
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
  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidatePath("/admin/platforms");
  revalidatePath("/download");
  return { ok: true, message: "Saved." };
}

export async function togglePlatformAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";
  if (!id) return { ok: false, message: "Missing platform id." };

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const { error } = await supabase
    .from("platform_downloads")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) return { ok: false, message: `Failed: ${error.message}` };

  revalidatePath("/admin/platforms");
  revalidatePath("/download");
  return { ok: true, message: nextActive ? "Now visible." : "Hidden." };
}

export async function deletePlatformAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing platform id." };

  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;
  const { error } = await supabase.from("platform_downloads").delete().eq("id", id);
  if (error) return { ok: false, message: `Failed to delete: ${error.message}` };

  revalidatePath("/admin/platforms");
  revalidatePath("/download");
  return { ok: true, message: "Deleted." };
}
