import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

type HomePageProps = {
  searchParams: Promise<{
    sort?: string;
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const sort = params.sort ?? "1";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("id,title,description,price,cover,active,created_at")
    .eq("active", true);

  if (sort === "1") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "2") {
    query = query.order("price", { ascending: true });
  } else if (sort === "3") {
    query = query.order("price", { ascending: false });
  }

  const { data: products, error } = await query;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          Mobile Card Store
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
          Products
        </h1>
      </header>

      <section className="mb-4 flex items-center gap-2 text-xs">
        <Link
          href="/?sort=1"
          className={`rounded-full border px-3 py-1.5 ${
            sort === "1"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          Newest
        </Link>
        <Link
          href="/?sort=2"
          className={`rounded-full border px-3 py-1.5 ${
            sort === "2"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          Price Low
        </Link>
        <Link
          href="/?sort=3"
          className={`rounded-full border px-3 py-1.5 ${
            sort === "3"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          Price High
        </Link>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load products: {error.message}
        </section>
      ) : products && products.length > 0 ? (
        <section className="grid grid-cols-2 gap-3">
          {products.map((product: Product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="rounded-2xl border border-neutral-200 bg-white p-3 transition hover:border-neutral-300"
            >
              <div className="mb-2 flex aspect-square items-center justify-center rounded-xl bg-neutral-100 text-xs text-neutral-400">
                {product.cover ? "Cover" : "No Image"}
              </div>
              <h2 className="line-clamp-2 text-sm font-medium text-neutral-900">
                {product.title}
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          No active products found. Add products in `/admin/products` or
          Supabase table `products`.
        </section>
      )}
    </main>
  );
}
