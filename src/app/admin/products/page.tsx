import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import { getAdminCardTypes, type AdminDict } from "@/lib/i18n/admin-dictionaries";
import { adminCategoryLabel } from "@/lib/i18n/admin-labels";
import type { Locale } from "@/lib/i18n/config";
import {
  createProductAction,
  deleteProductAction,
  toggleProductStatusAction,
  updateProductAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

type CategoryOption = { id: string; name_en: string; name_zh: string | null };

function CardTypeSelect({ t, value }: { t: AdminDict; value?: string | null }) {
  return (
    <select name="card_type" defaultValue={value ?? ""} className={inputClass}>
      <option value="">{t.noCardType}</option>
      {getAdminCardTypes(t).map((ct) => (
        <option key={ct.value} value={ct.value}>
          {ct.label}
        </option>
      ))}
    </select>
  );
}

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

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminProductsPage() {
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();

  const [{ data: categories }, { data: products, error }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name_en,name_zh")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        "id,title,name_en,name_zh,description_en,description_zh,price,cover,category_id,card_type,active,created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const cats = categories ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.productsTitle}
      />

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">{t.createProduct}</h2>
        <ActionForm
          action={createProductAction}
          resetOnSuccess
          className="mt-3 grid gap-2"
          buttonClassName="mt-1 h-10 rounded-lg bg-neutral-900 text-sm font-medium text-white"
          submitLabel={t.createProductBtn}
          pendingLabel={t.creating}
        >
          <input name="name_en" required placeholder={t.nameEn} className={inputClass} />
          <input name="name_zh" placeholder={t.nameZh} className={inputClass} />
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            required
            placeholder={t.priceUsd}
            className={inputClass}
          />
          <CategorySelect categories={cats} locale={locale} t={t} />
          <CardTypeSelect t={t} />
          <input name="cover" placeholder={t.coverUrlOptional} className={inputClass} />
          <label className="text-xs font-medium text-neutral-600">
            {t.uploadCover}
            <input
              name="cover_file"
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </label>
          <textarea
            name="description_en"
            rows={2}
            placeholder={t.descEn}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <textarea
            name="description_zh"
            rows={2}
            placeholder={t.descZh}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </ActionForm>
      </section>

      <section className="mt-4 grid gap-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {t.loadFailed}: {error.message}
          </div>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600">{formatPrice(product.price)}</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    product.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {product.active ? t.active : t.inactive}
                </span>
              </div>

              <ActionForm
                action={updateProductAction}
                className="mt-2 grid gap-2"
                buttonClassName="h-9 rounded-lg bg-neutral-900 text-sm font-semibold text-white"
                submitLabel={t.save}
                pendingLabel={t.saving}
              >
                <input type="hidden" name="id" value={product.id} />
                <input
                  name="name_en"
                  required
                  defaultValue={product.name_en ?? product.title}
                  className={inputClass}
                />
                <input
                  name="name_zh"
                  defaultValue={product.name_zh ?? ""}
                  placeholder={t.nameZhShort}
                  className={inputClass}
                />
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue={product.price}
                  className={inputClass}
                />
                <CategorySelect
                  categories={cats}
                  locale={locale}
                  t={t}
                  value={product.category_id}
                />
                <CardTypeSelect t={t} value={product.card_type} />
                <input
                  name="cover"
                  defaultValue={product.cover ?? ""}
                  placeholder={t.coverUrl}
                  className={inputClass}
                />
                <label className="text-xs font-medium text-neutral-600">
                  {t.replaceCover}
                  <input
                    name="cover_file"
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full text-xs text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  />
                </label>
                <textarea
                  name="description_en"
                  rows={2}
                  defaultValue={product.description_en ?? ""}
                  placeholder={t.descEn}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
                <textarea
                  name="description_zh"
                  rows={2}
                  defaultValue={product.description_zh ?? ""}
                  placeholder={t.descZh}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </ActionForm>

              <div className="mt-2 flex gap-2">
                <ActionForm
                  action={toggleProductStatusAction}
                  className="flex-1"
                  buttonClassName={`h-9 w-full rounded-lg border text-xs font-semibold ${
                    product.active
                      ? "border-amber-300 text-amber-700"
                      : "border-emerald-300 text-emerald-700"
                  }`}
                  submitLabel={product.active ? t.hideFromStore : t.showOnStore}
                  pendingLabel={t.pending}
                >
                  <input type="hidden" name="id" value={product.id} />
                  <input
                    type="hidden"
                    name="nextActive"
                    value={product.active ? "false" : "true"}
                  />
                </ActionForm>
                <ActionForm
                  action={deleteProductAction}
                  className="flex-1"
                  buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                  submitLabel={t.delete}
                  pendingLabel={t.deleting}
                  confirm={t.confirmDeleteProduct}
                >
                  <input type="hidden" name="id" value={product.id} />
                </ActionForm>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            {t.empty}
          </div>
        )}
      </section>
    </main>
  );
}
