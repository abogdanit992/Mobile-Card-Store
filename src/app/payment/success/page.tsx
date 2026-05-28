import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PayButton } from "./pay-button";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";

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
      <MobileShell showNav={false}>
        <StoreHeader title="支付" backHref="/" />
        <div className="p-4">
          <section className="rounded-xl border border-amber-900/40 bg-amber-950/30 p-4 text-sm text-amber-200">
            参数缺失，请重新下单
          </section>
        </div>
      </MobileShell>
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
    <MobileShell showNav={false}>
      <StoreHeader title="支付成功" backHref="/" />

      <div className="px-4 pt-4">
        <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-2xl text-white glow-pink">
            ✓
          </div>
          <p className="mt-3 text-sm font-bold text-[var(--accent-soft)]">
            支付已完成
          </p>
          <h1 className="mt-1 text-lg font-bold text-white">
            {product ? product.title : "您的订单"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            点击下方按钮，系统将自动创建订单并发放卡密
          </p>
        </section>

        <PayButton productId={productId} />

        <Link
          href="/"
          className="mt-3 block text-center text-sm text-[var(--muted)] hover:text-[var(--accent-soft)]"
        >
          取消返回
        </Link>
      </div>
    </MobileShell>
  );
}
