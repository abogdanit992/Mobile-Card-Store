import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CheckoutPageProps = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { productId } = await searchParams;

  if (!productId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Missing productId. Please choose a product first.
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id,title,price,active")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load checkout: {error.message}
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          Product not found or inactive.
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold text-neutral-900">Checkout</h1>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <p className="text-sm text-neutral-500">Selected product</p>
        <h2 className="mt-1 text-lg font-medium text-neutral-900">{product.title}</h2>
        <p className="mt-2 text-xl font-bold text-neutral-900">
          {formatPrice(product.price)}
        </p>
      </section>

      <Link
        href={`/payment/success?productId=${product.id}`}
        className="mt-5 flex h-12 items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white"
      >
        Simulate Payment Success
      </Link>
    </main>
  );
}
