import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import {
  createCategoryAction,
  deleteCategoryAction,
  toggleCategoryAction,
  updateCategoryAction,
} from "./actions";
import { adminInputClass as inputClass } from "@/lib/admin/form-styles";

export default async function AdminCategoriesPage() {
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id,slug,name_en,name_zh,icon_url,sort_order,active,stack_monthly_codes")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.categoriesTitle}
        subtitle={t.categoriesSubtitle}
      />

      <ActionForm
        action={createCategoryAction}
        resetOnSuccess
        className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel={t.addCategory}
        pendingLabel={t.adding}
      >
        <h2 className="text-sm font-semibold text-neutral-900">{t.newCategory}</h2>
        <input name="name_en" placeholder={t.nameEn} className={inputClass} required />
        <input name="name_zh" placeholder={t.nameZh} className={inputClass} />
        <input name="slug" placeholder={t.slugOptional} className={inputClass} />
        <input name="icon_url" placeholder={t.iconUrl} className={inputClass} />
        <input
          name="sort_order"
          type="number"
          defaultValue={0}
          placeholder={t.sortOrder}
          className={inputClass}
        />
        <label className="flex items-start gap-2 text-xs text-neutral-700">
          <input type="checkbox" name="stack_monthly_codes" className="mt-0.5 h-4 w-4" />
          <span>
            <span className="font-semibold">{t.stackMonthlyCodes}</span>
            <span className="mt-1 block text-neutral-500">{t.stackMonthlyCodesHint}</span>
          </span>
        </label>
      </ActionForm>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {t.loadFailed}: {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {categories?.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <ActionForm
              action={updateCategoryAction}
              className="space-y-2"
              buttonClassName="h-9 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              submitLabel={t.save}
              pendingLabel={t.saving}
            >
              <input type="hidden" name="id" value={c.id} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">{c.slug}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    c.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {c.active ? t.active : t.hidden}
                </span>
              </div>
              <input
                name="name_en"
                defaultValue={c.name_en}
                className={inputClass}
                required
              />
              <input
                name="name_zh"
                defaultValue={c.name_zh ?? ""}
                placeholder={t.nameZhShort}
                className={inputClass}
              />
              <input
                name="icon_url"
                defaultValue={c.icon_url ?? ""}
                placeholder={t.iconUrl}
                className={inputClass}
              />
              <input
                name="sort_order"
                type="number"
                defaultValue={c.sort_order}
                className={inputClass}
              />
              <label className="flex items-start gap-2 text-xs text-neutral-700">
                <input
                  type="checkbox"
                  name="stack_monthly_codes"
                  defaultChecked={c.stack_monthly_codes}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  <span className="font-semibold">{t.stackMonthlyCodes}</span>
                  <span className="mt-1 block text-neutral-500">
                    {t.stackMonthlyCodesHint}
                  </span>
                </span>
              </label>
            </ActionForm>
            <div className="mt-2 flex gap-2">
              <ActionForm
                action={toggleCategoryAction}
                className="flex-1"
                buttonClassName={`h-9 w-full rounded-lg border text-xs font-semibold ${
                  c.active
                    ? "border-amber-300 text-amber-700"
                    : "border-emerald-300 text-emerald-700"
                }`}
                submitLabel={c.active ? t.hideFromStore : t.showOnStore}
                pendingLabel={t.pending}
              >
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="nextActive" value={String(!c.active)} />
              </ActionForm>
              <ActionForm
                action={deleteCategoryAction}
                className="flex-1"
                buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel={t.delete}
                pendingLabel={t.deleting}
                confirm={t.confirmDeleteCategory}
              >
                <input type="hidden" name="id" value={c.id} />
              </ActionForm>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
