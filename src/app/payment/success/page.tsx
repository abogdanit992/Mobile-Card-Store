import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PayButton } from "./pay-button";

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { productId } = await searchParams;

  if (!productId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Missing productId. Please restart checkout from product detail page.
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("id,title")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-medium text-emerald-700">Payment successful</p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">
          {product ? product.title : "Order"}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Confirm to create order and allocate one unused card code from
          inventory.
        </p>
      </section>
      <PayButton productId={productId} />
      <Link href="/" className="mt-3 text-center text-sm text-neutral-500">
        Cancel and return to products
      </Link>
    </main>
  );
}
