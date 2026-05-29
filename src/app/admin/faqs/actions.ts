"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/lib/admin/action-result";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createFaqAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const questionEn = read(formData, "question_en");
  const answerEn = read(formData, "answer_en");
  if (!questionEn) return { ok: false, message: "English question is required." };
  if (!answerEn) return { ok: false, message: "English answer is required." };

  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const supabase = await createSupabaseServerClient();
  const payload: Database["public"]["Tables"]["faqs"]["Insert"] = {
    question_en: questionEn,
    question_zh: read(formData, "question_zh") || null,
    answer_en: answerEn,
    answer_zh: read(formData, "answer_zh") || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true,
  };

  const { error } = await supabase.from("faqs").insert([payload]);
  if (error) return { ok: false, message: `Failed to create: ${error.message}` };

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { ok: true, message: "Created." };
}

export async function updateFaqAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing FAQ id." };

  const questionEn = read(formData, "question_en");
  const answerEn = read(formData, "answer_en");
  if (!questionEn) return { ok: false, message: "English question is required." };
  if (!answerEn) return { ok: false, message: "English answer is required." };

  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const supabase = await createSupabaseServerClient();
  const update: Database["public"]["Tables"]["faqs"]["Update"] = {
    question_en: questionEn,
    question_zh: read(formData, "question_zh") || null,
    answer_en: answerEn,
    answer_zh: read(formData, "answer_zh") || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  const { error } = await supabase.from("faqs").update(update).eq("id", id);
  if (error) return { ok: false, message: `Failed to save: ${error.message}` };

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { ok: true, message: "Saved." };
}

export async function toggleFaqAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";
  if (!id) return { ok: false, message: "Missing FAQ id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("faqs").update({ active: nextActive }).eq("id", id);
  if (error) return { ok: false, message: `Failed: ${error.message}` };

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { ok: true, message: nextActive ? "Now visible." : "Hidden." };
}

export async function deleteFaqAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = read(formData, "id");
  if (!id) return { ok: false, message: "Missing FAQ id." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { ok: false, message: `Failed to delete: ${error.message}` };

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { ok: true, message: "Deleted." };
}
