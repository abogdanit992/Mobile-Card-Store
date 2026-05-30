import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import {
  createFaqAction,
  deleteFaqAction,
  toggleFaqAction,
  updateFaqAction,
} from "./actions";
import {
  adminInputClass as inputClass,
  adminTextareaClass as areaClass,
} from "@/lib/admin/form-styles";

export default async function AdminFaqsPage() {
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("id,question_en,question_zh,answer_en,answer_zh,sort_order,active")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.faqsTitle}
        subtitle={t.faqsSubtitle}
      />

      <ActionForm
        action={createFaqAction}
        resetOnSuccess
        className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel={t.addFaq}
        pendingLabel={t.adding}
      >
        <h2 className="text-sm font-semibold text-neutral-900">{t.newFaq}</h2>
        <input name="question_en" placeholder={t.questionEn} className={inputClass} required />
        <input name="question_zh" placeholder={t.questionZh} className={inputClass} />
        <textarea
          name="answer_en"
          rows={3}
          placeholder={t.answerEn}
          className={areaClass}
          required
        />
        <textarea name="answer_zh" rows={3} placeholder={t.answerZh} className={areaClass} />
        <input
          name="sort_order"
          type="number"
          defaultValue={0}
          placeholder={t.sortOrder}
          className={inputClass}
        />
      </ActionForm>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {t.loadFailed}: {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {faqs?.map((f) => (
          <div key={f.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <ActionForm
              action={updateFaqAction}
              className="space-y-2"
              buttonClassName="h-9 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              submitLabel={t.save}
              pendingLabel={t.saving}
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
                  {f.active ? t.active : t.hidden}
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
                placeholder={t.questionZh}
                className={inputClass}
              />
              <textarea
                name="answer_en"
                rows={3}
                defaultValue={f.answer_en}
                placeholder={t.answerEn}
                className={areaClass}
                required
              />
              <textarea
                name="answer_zh"
                rows={3}
                defaultValue={f.answer_zh ?? ""}
                placeholder={t.answerZh}
                className={areaClass}
              />
              <input
                name="sort_order"
                type="number"
                defaultValue={f.sort_order}
                placeholder={t.sortOrder}
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
                submitLabel={f.active ? t.hideFromStore : t.showOnStore}
                pendingLabel={t.pending}
              >
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="nextActive" value={String(!f.active)} />
              </ActionForm>
              <ActionForm
                action={deleteFaqAction}
                className="flex-1"
                buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel={t.delete}
                pendingLabel={t.deleting}
                confirm={t.confirmDeleteFaq}
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
