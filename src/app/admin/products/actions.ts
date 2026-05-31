"use server";

import { revalidatePath } from "next/cache";
import { requireAdminForAction } from "@/lib/auth/require-admin";
import { uploadImageFile } from "@/lib/storage";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";
import { logAdminAudit } from "@/lib/security/audit-log";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createProductAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase, email } = gate;

  const nameEn = read(formData, "name_en");
  const nameZh = read(formData, "name_zh");
  const cover = read(formData, "cover");
  const categoryId = read(formData, "category_id");
  const priceRaw = Number(formData.get("price"));

  if (!nameEn || Number.isNaN(priceRaw) || priceRaw < 0) {
    return { ok: false, message: "Invalid product input." };
  }

  let coverUrl = cover || null;
  try {
    const uploaded = await uploadImageFile(formData.get("cover_file"), "products");
    if (uploaded) coverUrl = uploaded;
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }

  const payload: Database["public"]["Tables"]["products"]["Insert"] = {
    title: nameEn,
    name_en: nameEn,
    name_zh: nameZh || null,
    description_en: read(formData, "description_en") || null,
    description_zh: read(formData, "description_zh") || null,
    cover: coverUrl,
    category_id: categoryId || null,
    card_type: read(formData, "card_type") || null,
    price: priceRaw,
    active: true,
  };

  const { error } = await supabase.from("products").insert([payload]);
  if (error) return { ok: false, message: `Failed to create: ${error.message}` };

  await logAdminAudit(email, "product.create", { nameEn });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, message: `Created “${nameEn}”.` };
}

export async function updateProductAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase, email } = gate;

  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing product id." };

  const nameEn = read(formData, "name_en");
  const categoryId = read(formData, "category_id");
  const priceRaw = Number(formData.get("price"));

  if (!nameEn || Number.isNaN(priceRaw) || priceRaw < 0) {
    return { ok: false, message: "Invalid product input." };
  }

  let coverUrl = read(formData, "cover") || null;
  try {
    const uploaded = await uploadImageFile(formData.get("cover_file"), "products");
    if (uploaded) coverUrl = uploaded;
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }

  const update: Database["public"]["Tables"]["products"]["Update"] = {
    title: nameEn,
    name_en: nameEn,
    name_zh: read(formData, "name_zh") || null,
    description_en: read(formData, "description_en") || null,
    description_zh: read(formData, "description_zh") || null,
    cover: coverUrl,
    category_id: categoryId || null,
    card_type: read(formData, "card_type") || null,
    price: priceRaw,
  };

  const { error } = await supabase.from("products").update(update).eq("id", id);
  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  await logAdminAudit(email, "product.update", { id });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, message: "Saved." };
}

export async function toggleProductStatusAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase } = gate;

  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";
  if (!id) return { ok: false, message: "Missing product id." };

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
  const gate = await requireAdminForAction();
  if (!gate.ok) return gate;
  const { supabase, email } = gate;

  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing product id." };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: `Failed to delete: ${error.message}` };

  await logAdminAudit(email, "product.delete", { id });

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, message: "Deleted." };
}
