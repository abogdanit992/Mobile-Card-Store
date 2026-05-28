import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { MobileShell } from "@/components/mobile-shell";
import { PrimaryButton } from "@/components/primary-button";
import { StoreHeader } from "@/components/store-header";

type CheckoutPageProps = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { productId } = await searchParams;

  if (!productId) {
    return (
      <MobileShell showNav={false}>
        <StoreHeader title="结算" backHref="/" />
        <div className="p-4">
          <section className="rounded-xl border border-amber-900/40 bg-amber-950/30 p-4 text-sm text-amber-200">
            请先选择商品
          </section>
        </div>
      </MobileShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id,title,price,active")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  if (error || !product) {
    return (
      <MobileShell showNav={false}>
        <StoreHeader title="结算" backHref="/" />
        <div className="p-4">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
            {error?.message ?? "商品不存在或已下架"}
          </section>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell showNav={false}>
      <StoreHeader title="确认订单" backHref={`/products/${product.id}`} backLabel="返回" />

      <div className="space-y-3 px-3 pt-3 pb-28">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">
            订单信息
          </p>
          <h2 className="mt-2 text-lg font-bold text-white">{product.title}</h2>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="text-sm text-[var(--muted)]">应付金额</span>
            <span className="text-2xl font-black text-[var(--gold)]">
              {formatPrice(product.price)}
            </span>
          </div>
        </section>

        <section className="rounded-xl border border-dashed border-[var(--border)] bg-black/30 p-3 text-xs text-[var(--muted)]">
          演示模式：点击支付后将模拟成功，并自动从库存分配卡密。
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-[var(--border)] bg-[#0c0612]/95 p-3 backdrop-blur-md">
        <PrimaryButton href={`/payment/success?productId=${product.id}`}>
          去支付 {formatPrice(product.price)}
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}
