import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminCustomersPage() {
  const backHref = await adminHref("/admin");
  const exportHref = await adminHref("/admin/customers/export");
  const supabase = await createSupabaseServerClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("id,email,phone,order_count,total_spent,last_order_at")
    .order("last_order_at", { ascending: false })
    .limit(500);

  const totalCustomers = customers?.length ?? 0;
  const withEmail = customers?.filter((c) => c.email).length ?? 0;
  const withPhone = customers?.filter((c) => c.phone).length ?? 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Customers</h1>
      <p className="text-sm text-neutral-500">
        Built from paid orders. Use for mass campaigns.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <p className="text-lg font-bold text-neutral-900">{totalCustomers}</p>
          <p className="text-[10px] text-neutral-500">Total</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <p className="text-lg font-bold text-neutral-900">{withEmail}</p>
          <p className="text-[10px] text-neutral-500">Email</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <p className="text-lg font-bold text-neutral-900">{withPhone}</p>
          <p className="text-[10px] text-neutral-500">Phone</p>
        </div>
      </div>

      <a
        href={exportHref}
        className="mt-3 block h-10 rounded-lg bg-neutral-900 text-center text-sm font-semibold leading-10 text-white"
      >
        Export CSV
      </a>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-2">
        {customers?.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-neutral-200 bg-white p-3"
          >
            <p className="text-sm font-medium text-neutral-900">
              {c.email ?? "—"}
            </p>
            <p className="text-xs text-neutral-500">{c.phone ?? "—"}</p>
            <p className="mt-1 text-xs text-neutral-700">
              {c.order_count} orders · {formatPrice(Number(c.total_spent))}
              {c.last_order_at
                ? ` · ${new Date(c.last_order_at).toLocaleDateString("en-US")}`
                : ""}
            </p>
          </div>
        ))}
        {totalCustomers === 0 ? (
          <p className="text-sm text-neutral-500">No customers yet.</p>
        ) : null}
      </section>
    </main>
  );
}
