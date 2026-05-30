import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import { getAdminCardTypes } from "@/lib/i18n/admin-dictionaries";
import { adminCategoryLabel, adminProductLabel } from "@/lib/i18n/admin-labels";
import type { Locale } from "@/lib/i18n/config";
import type { AdminDict } from "@/lib/i18n/admin-dictionaries";
import {
  bulkImportCardsAction,
  clearCardsAction,
  createCardAction,
  deleteCardAction,
} from "./actions";

import {
  adminSelectClass as selectClass,
  adminTextareaMonoClass,
} from "@/lib/admin/form-styles";

type CategoryRow = { id: string; name_en: string; name_zh: string | null };

function PlatformSelect({
  categories,
  locale,
  t,
}: {
  categories: CategoryRow[];
  locale: Locale;
  t: AdminDict;
}) {
  return (
    <select name="categoryId" required defaultValue="" className={selectClass}>
      <option value="" disabled>
        {t.selectPlatform}
      </option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {adminCategoryLabel(locale, c.name_en, c.name_zh)}
        </option>
      ))}
    </select>
  );
}

function CardTypeSelect({ t }: { t: AdminDict }) {
  return (
    <select name="cardType" required defaultValue="" className={selectClass}>
      <option value="" disabled>
        {t.selectCardType}
      </option>
      {getAdminCardTypes(t).map((ct) => (
        <option key={ct.value} value={ct.value}>
          {ct.label}
        </option>
      ))}
    </select>
  );
}

export default async function AdminCardsPage() {
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();

  const [{ data: products }, { data: categories }, { data: cards, error }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,title,name_en,name_zh,active")
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id,name_en,name_zh")
        .order("sort_order", { ascending: true }),
      supabase
        .from("cards")
        .select("id,product_id,code,used,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  const cats = categories ?? [];

  const total = cards?.length ?? 0;
  const available = cards?.filter((item) => !item.used).length ?? 0;
  const used = total - available;
  const productName = new Map(
    (products ?? []).map((p) => [
      p.id,
      adminProductLabel(locale, p.name_en, p.name_zh, p.title),
    ]),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.cardsTitle}
      />

      <section className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl border border-neutral-200 bg-white p-2">
          <p className="text-neutral-500">{t.statTotal}</p>
          <p className="mt-1 text-base font-semibold text-neutral-900">{total}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-2">
          <p className="text-neutral-500">{t.statAvailable}</p>
          <p className="mt-1 text-base font-semibold text-emerald-700">{available}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-2">
          <p className="text-neutral-500">{t.statUsed}</p>
          <p className="mt-1 text-base font-semibold text-amber-700">{used}</p>
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">{t.clearInventory}</h2>
        <p className="mt-1 text-xs text-neutral-500">{t.clearInventoryHint}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <ActionForm
            action={clearCardsAction}
            buttonClassName="h-9 w-full rounded-lg border border-amber-300 text-xs font-semibold text-amber-700"
            submitLabel={t.clearUsed}
            pendingLabel={t.pending}
            confirm={t.confirmClearUsed}
          >
            <input type="hidden" name="scope" value="used" />
          </ActionForm>
          <ActionForm
            action={clearCardsAction}
            buttonClassName="h-9 w-full rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700"
            submitLabel={t.clearAvailable}
            pendingLabel={t.pending}
            confirm={t.confirmClearAvailable}
          >
            <input type="hidden" name="scope" value="available" />
          </ActionForm>
          <ActionForm
            action={clearCardsAction}
            buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
            submitLabel={t.clearAll}
            pendingLabel={t.pending}
            confirm={t.confirmClearAll}
          >
            <input type="hidden" name="scope" value="all" />
          </ActionForm>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">{t.bulkImport}</h2>
        <p className="mt-1 text-xs text-neutral-500">{t.bulkImportHint}</p>
        <ActionForm
          action={bulkImportCardsAction}
          resetOnSuccess
          className="mt-3 grid gap-2"
          buttonClassName="h-10 rounded-lg bg-neutral-900 text-sm font-semibold text-white"
          submitLabel={t.importCards}
          pendingLabel={t.importing}
        >
          <PlatformSelect categories={cats} locale={locale} t={t} />
          <CardTypeSelect t={t} />
          <input
            name="file"
            type="file"
            accept=".txt,text/plain"
            className="block w-full text-xs text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <textarea
            name="codes"
            rows={5}
            placeholder={t.pasteCodesPh}
            className={adminTextareaMonoClass}
          />
        </ActionForm>
      </section>

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">{t.addSingleCard}</h2>
        <form action={createCardAction} className="mt-3 grid gap-2">
          <PlatformSelect categories={cats} locale={locale} t={t} />
          <CardTypeSelect t={t} />
          <input
            name="code"
            type="text"
            required
            placeholder={t.cardCodeUnique}
            className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-600"
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-neutral-900 text-sm font-medium text-white"
          >
            {t.addCardBtn}
          </button>
        </form>
      </section>

      <section className="mt-4 grid gap-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {t.loadFailed}: {error.message}
          </div>
        ) : cards && cards.length > 0 ? (
          cards.map((card) => (
            <article
              key={card.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <p className="break-all rounded-md bg-neutral-100 p-2 font-mono text-xs text-neutral-900">
                {card.code}
              </p>
              <p className="mt-2 text-xs text-neutral-600">
                {t.product}: {productName.get(card.product_id) ?? card.product_id}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                {t.status}: {card.used ? t.statusUsed : t.statusAvailable}
              </p>
              <ActionForm
                action={deleteCardAction}
                className="mt-2"
                buttonClassName="h-8 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel={t.delete}
                pendingLabel={t.deleting}
                confirm={t.confirmDeleteCard}
              >
                <input type="hidden" name="id" value={card.id} />
              </ActionForm>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            {t.noCards}
          </div>
        )}
      </section>
    </main>
  );
}
