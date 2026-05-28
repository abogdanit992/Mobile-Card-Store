import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";

type LookupPageProps = {
  searchParams: Promise<{
    email?: string;
    phone?: string;
  }>;
};

export default async function OrderLookupPage({ searchParams }: LookupPageProps) {
  const { email, phone } = await searchParams;
  const normalizedEmail = email?.trim().toLowerCase();

  let orders: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    contact_phone: string | null;
  }> = [];
  let errorMessage: string | null = null;

  if (normalizedEmail) {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("orders")
      .select("id,amount,status,created_at,contact_phone,contact_email")
      .eq("contact_email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(50);

    if (phone?.trim()) {
      query = query.eq("contact_phone", phone.trim());
    }

    const { data, error } = await query;
    if (error) {
      errorMessage = error.message;
    } else {
      orders = data ?? [];
    }
  }

  return (
    <MobileShell>
      <StoreHeader title="查询订单" subtitle="使用下单邮箱查询" backHref="/" />

      <div className="px-3 pt-3">
        <form className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div>
            <label className="text-xs text-[var(--muted)]">邮箱（必填）</label>
            <input
              name="email"
              type="email"
              required
              defaultValue={normalizedEmail ?? ""}
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">手机号（可选，精确匹配）</label>
            <input
              name="phone"
              type="tel"
              defaultValue={phone ?? ""}
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-bold text-white"
          >
            查询
          </button>
        </form>

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
        ) : null}

        {normalizedEmail ? (
          <section className="mt-4 grid gap-2">
            {orders.length > 0 ? (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/cards?orderId=${order.id}`}
                  className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent-soft)]"
                >
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(order.created_at).toLocaleString("zh-CN")}
                  </p>
                  <p className="mt-1 font-bold text-[var(--gold)]">
                    {formatPrice(order.amount)} · {order.status}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    订单 {order.id.slice(0, 8)}…
                    {order.contact_phone ? ` · ${order.contact_phone}` : ""}
                  </p>
                  <p className="mt-2 text-xs text-[var(--accent-soft)]">查看卡密 →</p>
                </Link>
              ))
            ) : (
              <p className="text-center text-sm text-[var(--muted)]">未找到相关订单</p>
            )}
          </section>
        ) : null}
      </div>
    </MobileShell>
  );
}
