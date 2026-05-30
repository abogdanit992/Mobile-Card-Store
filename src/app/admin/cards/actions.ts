"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

/** Split a blob of text into clean, de-duplicated card codes. */
function parseCodes(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split(/[\r\n,;\t ]+/)) {
    const code = line.trim();
    if (!code) continue;
    if (seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }
  return out;
}

export async function bulkImportCardsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return { ok: false, message: "Please select a product first." };

  const pasted = String(formData.get("codes") ?? "");
  const file = formData.get("file");
  let fileText = "";
  if (file instanceof File && file.size > 0) {
    fileText = await file.text();
  }

  const codes = parseCodes(`${pasted}\n${fileText}`);
  if (codes.length === 0) {
    return { ok: false, message: "No card codes found. Paste codes or upload a .txt file." };
  }

  const supabase = await createSupabaseServerClient();

  // Skip codes that already exist (avoids the whole batch failing on a dupe).
  const { data: existingRows, error: existingError } = await supabase
    .from("cards")
    .select("code")
    .in("code", codes);
  if (existingError) {
    return { ok: false, message: `Failed to check existing: ${existingError.message}` };
  }

  const existing = new Set((existingRows ?? []).map((r) => r.code));
  const fresh = codes.filter((code) => !existing.has(code));

  if (fresh.length === 0) {
    return {
      ok: false,
      message: `All ${codes.length} codes already exist. Nothing imported.`,
    };
  }

  const payload: Database["public"]["Tables"]["cards"]["Insert"][] = fresh.map(
    (code) => ({ product_id: productId, code, used: false }),
  );

  const { error } = await supabase.from("cards").insert(payload);
  if (error) return { ok: false, message: `Import failed: ${error.message}` };

  revalidatePath("/admin/cards");

  const skipped = codes.length - fresh.length;
  return {
    ok: true,
    message: `Imported ${fresh.length} card(s).${
      skipped > 0 ? ` Skipped ${skipped} duplicate(s).` : ""
    }`,
  };
}

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
