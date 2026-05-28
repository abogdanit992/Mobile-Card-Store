"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createCardAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!productId || !code) {
    throw new Error("Missing productId or code.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("cards").insert({
    product_id: productId,
    code,
    used: false,
  });

  if (error) {
    throw new Error(`Failed to create card: ${error.message}`);
  }

  revalidatePath("/admin/cards");
}
