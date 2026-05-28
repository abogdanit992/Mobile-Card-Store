import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/user";
import { formatPrice } from "@/lib/format";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { signOutAction } from "@/app/auth/actions";

export default async function AccountPage() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();

  const orders = user
    ? (
        await supabase
          .from("orders")
          .select("id,amount,status,created_at,contact_phone")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30)
      ).data
    : null;

  return (
    <MobileShell>
      <StoreHeader title="我的" subtitle="账户与订单" />

      <div className="px-3 pt-3">
        {!user ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm text-[var(--muted)]">
              使用邮箱注册并验证后，可在此查看订单记录。
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-center text-sm font-bold text-white"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-center text-sm font-bold text-white"
              >
                注册
              </Link>
            </div>
            <Link
              href="/orders/lookup"
              className="mt-4 block text-center text-sm text-[var(--accent-soft)]"
            >
              未登录？用邮箱查单 →
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-xs text-[var(--muted)]">已验证邮箱</p>
              <p className="mt-1 font-medium text-white">{user.email}</p>
              <form action={signOutAction} className="mt-3">
                <button
                  type="submit"
                  className="text-xs font-bold text-[var(--muted)] hover:text-[var(--accent-soft)]"
                >
                  退出登录
                </button>
              </form>
            </section>

            <h2 className="mb-2 mt-4 text-sm font-bold text-white">我的订单</h2>
            {orders && orders.length > 0 ? (
              <div className="grid gap-2">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/cards?orderId=${order.id}`}
                    className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                  >
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(order.created_at).toLocaleString("zh-CN")}
                    </p>
                    <p className="mt-1 font-bold text-[var(--gold)]">
                      {formatPrice(order.amount)} · {order.status}
                    </p>
                    <p className="mt-1 text-xs text-[var(--accent-soft)]">查看卡密 →</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">暂无订单，去首页选购吧。</p>
            )}
          </>
        )}
      </div>
    </MobileShell>
  );
}
