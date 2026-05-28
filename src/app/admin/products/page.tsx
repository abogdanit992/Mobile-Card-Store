import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createProductAction, toggleProductStatusAction } from "./actions";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminProductsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,title,price,active,created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <header className="mb-4">
        <Link href="/admin" className="text-sm text-neutral-500">
          ← Back to admin
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
          Product Management
        </h1>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">Create product</h2>
        <form action={createProductAction} className="mt-3 grid gap-2">
          <input
            name="title"
            type="text"
            required
            placeholder="Title"
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm"
          />
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            required
            placeholder="Price"
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm"
          />
          <input
            name="cover"
            type="text"
            placeholder="Cover URL (optional)"
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="Description (optional)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="mt-1 h-10 rounded-lg bg-neutral-900 text-sm font-medium text-white"
          >
            Create Product
          </button>
        </form>
      </section>

      <section className="mt-4 grid gap-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load products: {error.message}
          </div>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    product.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {product.active ? "Active" : "Inactive"}
                </span>
              </div>

              <form action={toggleProductStatusAction} className="mt-3">
                <input type="hidden" name="id" value={product.id} />
                <input
                  type="hidden"
                  name="nextActive"
                  value={product.active ? "false" : "true"}
                />
                <button
                  type="submit"
                  className="h-9 rounded-lg border border-neutral-300 px-3 text-xs font-medium text-neutral-800"
                >
                  {product.active ? "Set Inactive" : "Set Active"}
                </button>
              </form>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            No products yet.
          </div>
        )}
      </section>
    </main>
  );
}
