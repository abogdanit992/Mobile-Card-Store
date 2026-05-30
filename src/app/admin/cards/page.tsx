import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import { CARD_TYPES } from "@/lib/card-types";
import {
  bulkImportCardsAction,
  clearCardsAction,
  createCardAction,
  deleteCardAction,
} from "./actions";

const selectClass = "h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm";

function PlatformSelect({ categories }: { categories: { id: string; name_en: string }[] }) {
  return (
    <select name="categoryId" required defaultValue="" className={selectClass}>
      <option value="" disabled>
        Select platform
      </option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name_en}
        </option>
      ))}
    </select>
  );
}

function CardTypeSelect() {
  return (
    <select name="cardType" required defaultValue="" className={selectClass}>
      <option value="" disabled>
        Select card type
      </option>
      {CARD_TYPES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}

export default async function AdminCardsPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();

  const [{ data: products }, { data: categories }, { data: cards, error }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,title,active")
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id,name_en")
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
  const productName = new Map((products ?? []).map((p) => [p.id, p.title]));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Card Inventory</h1>

      <section className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl border border-neutral-200 bg-white p-2">
          <p className="text-neutral-500">Total</p>
          <p className="mt-1 text-base font-semibold text-neutral-900">{total}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-2">
          <p className="text-neutral-500">Available</p>
          <p className="mt-1 text-base font-semibold text-emerald-700">{available}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-2">
          <p className="text-neutral-500">Used</p>
          <p className="mt-1 text-base font-semibold text-amber-700">{used}</p>
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">Clear inventory</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Remove old / test cards. Deleting cards updates the counts above.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <ActionForm
            action={clearCardsAction}
            buttonClassName="h-9 w-full rounded-lg border border-amber-300 text-xs font-semibold text-amber-700"
            submitLabel="Clear used"
            pendingLabel="…"
            confirm="Delete ALL used cards? This cannot be undone."
          >
            <input type="hidden" name="scope" value="used" />
          </ActionForm>
          <ActionForm
            action={clearCardsAction}
            buttonClassName="h-9 w-full rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700"
            submitLabel="Clear available"
            pendingLabel="…"
            confirm="Delete ALL available cards? This cannot be undone."
          >
            <input type="hidden" name="scope" value="available" />
          </ActionForm>
          <ActionForm
            action={clearCardsAction}
            buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
            submitLabel="Clear ALL"
            pendingLabel="…"
            confirm="Delete EVERY card in inventory? This cannot be undone."
          >
            <input type="hidden" name="scope" value="all" />
          </ActionForm>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">Bulk import</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Upload a .txt file or paste codes — one per line (e.g.
          WZT064FC431E1BFF624B83C). Duplicates are skipped automatically.
        </p>
        <ActionForm
          action={bulkImportCardsAction}
          resetOnSuccess
          className="mt-3 grid gap-2"
          buttonClassName="h-10 rounded-lg bg-neutral-900 text-sm font-semibold text-white"
          submitLabel="Import cards"
          pendingLabel="Importing…"
        >
          <PlatformSelect categories={cats} />
          <CardTypeSelect />
          <input
            name="file"
            type="file"
            accept=".txt,text/plain"
            className="block w-full text-xs text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <textarea
            name="codes"
            rows={5}
            placeholder={"Or paste codes here, one per line\nWZT064FC431E1BFF624B83C\n..."}
            className="rounded-lg border border-neutral-300 px-3 py-2 font-mono text-xs"
          />
        </ActionForm>
      </section>

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">Add single card</h2>
        <form action={createCardAction} className="mt-3 grid gap-2">
          <PlatformSelect categories={cats} />
          <CardTypeSelect />
          <input
            name="code"
            type="text"
            required
            placeholder="Card code (unique)"
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm"
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-neutral-900 text-sm font-medium text-white"
          >
            Add Card
          </button>
        </form>
      </section>

      <section className="mt-4 grid gap-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load cards: {error.message}
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
                Product: {productName.get(card.product_id) ?? card.product_id}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Status: {card.used ? "Used" : "Available"}
              </p>
              <ActionForm
                action={deleteCardAction}
                className="mt-2"
                buttonClassName="h-8 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel="Delete card"
                pendingLabel="Deleting…"
                confirm="Delete this card? This cannot be undone."
              >
                <input type="hidden" name="id" value={card.id} />
              </ActionForm>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            No card inventory found.
          </div>
        )}
      </section>
    </main>
  );
}
