import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,title,description,price,cover,active")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load product: {error.message}
        </section>
      </main>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <header className="mb-4">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-700">
          ← Back to products
        </Link>
      </header>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex aspect-square items-center justify-center bg-neutral-100 text-neutral-400">
          {product.cover ? "Cover Image" : "No Image"}
        </div>

        <div className="space-y-3 p-4">
          <h1 className="text-xl font-semibold text-neutral-900">{product.title}</h1>
          <p className="text-2xl font-bold text-neutral-900">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm leading-6 text-neutral-600">
            {product.description || "No description yet."}
          </p>
        </div>
      </section>

      <div className="mt-5">
        <Link
          href={`/checkout?productId=${product.id}`}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white"
        >
          Buy Now
        </Link>
      </div>
    </main>
  );
}
