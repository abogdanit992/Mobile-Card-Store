import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";

export default function AccountPage() {
  return (
    <MobileShell>
      <StoreHeader title="我的" subtitle="订单与账户" />
      <div className="px-4 pt-4">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm text-[var(--muted)]">
            登录与历史订单功能将在下一阶段开放。
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex text-sm font-bold text-[var(--accent-soft)]"
          >
            返回选购 →
          </Link>
        </section>
      </div>
    </MobileShell>
  );
}
