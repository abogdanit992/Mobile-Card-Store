import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import {
  createFaqAction,
  deleteFaqAction,
  toggleFaqAction,
  updateFaqAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";
const areaClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900";

export default async function AdminFaqsPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("id,question_en,question_zh,answer_en,answer_zh,sort_order,active")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">FAQ</h1>
      <p className="text-sm text-neutral-500">Shown on the storefront /faq page</p>

      <ActionForm
        action={createFaqAction}
        resetOnSuccess
        className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel="Add FAQ"
        pendingLabel="Adding…"
      >
        <h2 className="text-sm font-semibold text-neutral-900">New FAQ</h2>
        <input name="question_en" placeholder="Question (EN) *" className={inputClass} required />
        <input name="question_zh" placeholder="问题 (中文)" className={inputClass} />
        <textarea
          name="answer_en"
          rows={3}
          placeholder="Answer (EN) *"
          className={areaClass}
          required
        />
        <textarea name="answer_zh" rows={3} placeholder="答案 (中文)" className={areaClass} />
        <input name="sort_order" type="number" defaultValue={0} className={inputClass} />
      </ActionForm>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {faqs?.map((f) => (
          <div key={f.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <ActionForm
              action={updateFaqAction}
              className="space-y-2"
              buttonClassName="h-9 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              submitLabel="Save"
              pendingLabel="Saving…"
            >
              <input type="hidden" name="id" value={f.id} />
              <div className="flex items-center justify-end">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    f.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {f.active ? "ACTIVE" : "HIDDEN"}
                </span>
              </div>
              <input
                name="question_en"
                defaultValue={f.question_en}
                className={inputClass}
                required
              />
              <input
                name="question_zh"
                defaultValue={f.question_zh ?? ""}
                placeholder="问题 (中文)"
                className={inputClass}
              />
              <textarea
                name="answer_en"
                rows={3}
                defaultValue={f.answer_en}
                className={areaClass}
                required
              />
              <textarea
                name="answer_zh"
                rows={3}
                defaultValue={f.answer_zh ?? ""}
                placeholder="答案 (中文)"
                className={areaClass}
              />
              <input
                name="sort_order"
                type="number"
                defaultValue={f.sort_order}
                className={inputClass}
              />
            </ActionForm>
            <div className="mt-2 flex gap-2">
              <ActionForm
                action={toggleFaqAction}
                className="flex-1"
                buttonClassName={`h-9 w-full rounded-lg border text-xs font-semibold ${
                  f.active
                    ? "border-amber-300 text-amber-700"
                    : "border-emerald-300 text-emerald-700"
                }`}
                submitLabel={f.active ? "Hide from store" : "Show on store"}
                pendingLabel="…"
              >
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="nextActive" value={String(!f.active)} />
              </ActionForm>
              <ActionForm
                action={deleteFaqAction}
                className="flex-1"
                buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel="Delete"
                pendingLabel="Deleting…"
                confirm="Delete this FAQ? This cannot be undone."
              >
                <input type="hidden" name="id" value={f.id} />
              </ActionForm>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
