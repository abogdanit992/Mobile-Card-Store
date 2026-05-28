"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function createCardAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!productId || !code) {
    throw new Error("Missing productId or code.");
  }

  const supabase = await createSupabaseServerClient();
  const payload = [
    {
      product_id: productId,
      code,
      used: false,
    } satisfies Database["public"]["Tables"]["cards"]["Insert"],
  ];
  const { error } = await supabase.from("cards").insert(payload);

  if (error) {
    throw new Error(`Failed to create card: ${error.message}`);
  }

  revalidatePath("/admin/cards");
}
