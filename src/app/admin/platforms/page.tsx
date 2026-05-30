import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import type { AdminDict } from "@/lib/i18n/admin-dictionaries";
import { adminCategoryLabel } from "@/lib/i18n/admin-labels";
import type { Locale } from "@/lib/i18n/config";
import {
  createPlatformAction,
  deletePlatformAction,
  togglePlatformAction,
  updatePlatformAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

type CategoryOption = { id: string; name_en: string; name_zh: string | null };

function CategorySelect({
  categories,
  locale,
  t,
  value,
}: {
  categories: CategoryOption[];
  locale: Locale;
  t: AdminDict;
  value?: string | null;
}) {
  return (
    <select name="category_id" defaultValue={value ?? ""} className={inputClass}>
      <option value="">{t.noCategory}</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {adminCategoryLabel(locale, c.name_en, c.name_zh)}
        </option>
      ))}
    </select>
  );
}

export default async function AdminPlatformsPage() {
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();

  const [{ data: categories }, { data: platforms, error }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name_en,name_zh")
      .order("sort_order", { ascending: true }),
    supabase
      .from("platform_downloads")
      .select(
        "id,category_id,name_en,name_zh,logo_url,android_url,ios_url,cloud_url,download_page,sort_order,active",
      )
      .order("sort_order", { ascending: true }),
  ]);

  const cats = categories ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.platformsTitle}
        subtitle={t.platformsSubtitle}
      />

      <ActionForm
        action={createPlatformAction}
        resetOnSuccess
        className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel={t.addPlatform}
        pendingLabel={t.adding}
      >
        <h2 className="text-sm font-semibold text-neutral-900">{t.newPlatform}</h2>
        <input name="name_en" placeholder={t.nameEn} className={inputClass} required />
        <input name="name_zh" placeholder={t.nameZh} className={inputClass} />
        <CategorySelect categories={cats} locale={locale} t={t} />
        <input name="logo_url" placeholder={t.logoUrl} className={inputClass} />
        <label className="text-xs font-medium text-neutral-600">
          {t.uploadLogo}
          <input
            name="logo_file"
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-xs text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
        </label>
        <input name="android_url" placeholder={t.androidUrl} className={inputClass} />
        <input name="ios_url" placeholder={t.iosUrl} className={inputClass} />
        <input name="cloud_url" placeholder={t.cloudUrl} className={inputClass} />
        <input name="download_page" placeholder={t.detailPageUrl} className={inputClass} />
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
        {platforms?.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <ActionForm
              action={updatePlatformAction}
              className="space-y-2"
              buttonClassName="h-9 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              submitLabel={t.save}
              pendingLabel={t.saving}
            >
              <input type="hidden" name="id" value={p.id} />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900">
                  {p.name_en}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {p.active ? t.active : t.hidden}
                </span>
              </div>
              <input name="name_en" defaultValue={p.name_en} className={inputClass} required />
              <input
                name="name_zh"
                defaultValue={p.name_zh ?? ""}
                placeholder={t.nameZhShort}
                className={inputClass}
              />
              <CategorySelect
                categories={cats}
                locale={locale}
                t={t}
                value={p.category_id}
              />
              <input
                name="logo_url"
                defaultValue={p.logo_url ?? ""}
                placeholder={t.logoUrl}
                className={inputClass}
              />
              <label className="text-xs font-medium text-neutral-600">
                {t.replaceLogo}
                <input
                  name="logo_file"
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-xs text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
              </label>
              <input
                name="android_url"
                defaultValue={p.android_url ?? ""}
                placeholder={t.androidUrl}
                className={inputClass}
              />
              <input
                name="ios_url"
                defaultValue={p.ios_url ?? ""}
                placeholder={t.iosUrl}
                className={inputClass}
              />
              <input
                name="cloud_url"
                defaultValue={p.cloud_url ?? ""}
                placeholder={t.cloudUrl}
                className={inputClass}
              />
              <input
                name="download_page"
                defaultValue={p.download_page ?? ""}
                placeholder={t.detailPageUrl}
                className={inputClass}
              />
              <input
                name="sort_order"
                type="number"
                defaultValue={p.sort_order}
                placeholder={t.sortOrder}
                className={inputClass}
              />
            </ActionForm>
            <div className="mt-2 flex gap-2">
              <ActionForm
                action={togglePlatformAction}
                className="flex-1"
                buttonClassName={`h-9 w-full rounded-lg border text-xs font-semibold ${
                  p.active
                    ? "border-amber-300 text-amber-700"
                    : "border-emerald-300 text-emerald-700"
                }`}
                submitLabel={p.active ? t.hideFromStore : t.showOnStore}
                pendingLabel={t.pending}
              >
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="nextActive" value={String(!p.active)} />
              </ActionForm>
              <ActionForm
                action={deletePlatformAction}
                className="flex-1"
                buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel={t.delete}
                pendingLabel={t.deleting}
                confirm={t.confirmDeletePlatform}
              >
                <input type="hidden" name="id" value={p.id} />
              </ActionForm>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
