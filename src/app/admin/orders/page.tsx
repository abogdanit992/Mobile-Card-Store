import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import type { AdminDict } from "@/lib/i18n/admin-dictionaries";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    status?: "pending" | "paid" | "cancelled";
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function orderStatusLabel(t: AdminDict, status: string) {
  if (status === "paid") return t.filterPaid;
  if (status === "pending") return t.filterPending;
  if (status === "cancelled") return t.filterCancelled;
  return status;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const { status } = await searchParams;
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const ordersBase = await adminHref("/admin/orders");
  const supabase = await createSupabaseServerClient();
  const dateLocale = locale === "zh" ? "zh-CN" : "en-US";

  let query = supabase
    .from("orders")
    .select("id,product_id,amount,status,created_at")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: orders, error } = await query.limit(100);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.ordersTitle}
      />

      <section className="mt-4 flex gap-2 text-xs">
        <Link
          href={ordersBase}
          className={`rounded-full border px-3 py-1.5 ${
            !status
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          {t.filterAll}
        </Link>
        <Link
          href={`${ordersBase}?status=paid`}
          className={`rounded-full border px-3 py-1.5 ${
            status === "paid"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          {t.filterPaid}
        </Link>
        <Link
          href={`${ordersBase}?status=pending`}
          className={`rounded-full border px-3 py-1.5 ${
            status === "pending"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          {t.filterPending}
        </Link>
        <Link
          href={`${ordersBase}?status=cancelled`}
          className={`rounded-full border px-3 py-1.5 ${
            status === "cancelled"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          {t.filterCancelled}
        </Link>
      </section>

      <section className="mt-4 grid gap-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {t.loadFailed}: {error.message}
          </div>
        ) : orders && orders.length > 0 ? (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <p className="break-all text-xs text-neutral-500">
                {t.orderId}: {order.id}
              </p>
              <p className="mt-2 text-sm font-medium text-neutral-900">
                {formatPrice(order.amount)}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                {t.product}: {order.product_id}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                {t.status}: {orderStatusLabel(t, order.status)} |{" "}
                {new Date(order.created_at).toLocaleString(dateLocale)}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            {t.empty}
          </div>
        )}
      </section>
    </main>
  );
}
