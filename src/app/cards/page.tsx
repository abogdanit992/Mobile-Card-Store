import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CardsPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Card Delivery</h1>
        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          Missing orderId. Please complete checkout first.
        </section>
        <Link
          href="/"
          className="mt-5 flex h-12 items-center justify-center rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-900"
        >
          Back to Products
        </Link>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,product_id,status,amount")
    .eq("id", orderId)
    .maybeSingle();

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select("id,code,used,used_at")
    .eq("used_order_id", orderId)
    .maybeSingle();

  const errorMessage = orderError?.message || cardError?.message;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Card Delivery</h1>
      {errorMessage ? (
        <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load card delivery: {errorMessage}
        </section>
      ) : card ? (
        <section className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-700">
            Delivered card code
          </p>
          <p className="mt-2 break-all rounded-lg bg-neutral-100 p-3 font-mono text-sm text-neutral-900">
            {card.code}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Order: {order?.id} | Status: {order?.status}
          </p>
        </section>
      ) : (
        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          No card allocated yet for this order.
        </section>
      )}

      <Link
        href="/"
        className="mt-5 flex h-12 items-center justify-center rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-900"
      >
        Back to Products
      </Link>
    </main>
  );
}
