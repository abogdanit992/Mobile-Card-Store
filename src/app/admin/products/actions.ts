"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createProductAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const cover = String(formData.get("cover") ?? "").trim();
  const priceRaw = Number(formData.get("price"));

  if (!title || Number.isNaN(priceRaw) || priceRaw < 0) {
    throw new Error("Invalid product input.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").insert({
    title,
    description: description || null,
    cover: cover || null,
    price: priceRaw,
    active: true,
  });

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function toggleProductStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nextActive = String(formData.get("nextActive") ?? "") === "true";

  if (!id) {
    throw new Error("Missing product id.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ active: nextActive })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}
