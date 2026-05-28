import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCardAction } from "./actions";

export default async function AdminCardsPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: products }, { data: cards, error }] = await Promise.all([
    supabase
      .from("products")
      .select("id,title,active")
      .order("created_at", { ascending: false }),
    supabase
      .from("cards")
      .select("id,product_id,code,used,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const total = cards?.length ?? 0;
  const available = cards?.filter((item) => !item.used).length ?? 0;
  const used = total - available;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href="/admin" className="text-sm text-neutral-500">
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

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">Add card code</h2>
        <form action={createCardAction} className="mt-3 grid gap-2">
          <select
            name="productId"
            required
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Select product
            </option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} {product.active ? "" : "(inactive)"}
              </option>
            ))}
          </select>
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
              <p className="mt-2 text-xs text-neutral-600">Product: {card.product_id}</p>
              <p className="mt-1 text-xs text-neutral-600">
                Status: {card.used ? "Used" : "Available"}
              </p>
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
