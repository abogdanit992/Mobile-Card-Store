import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PayButton } from "./pay-button";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    productId?: string;
    contactEmail?: string;
    contactPhone?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { productId, contactEmail, contactPhone } = await searchParams;

  if (!productId || !contactEmail || !contactPhone) {
    return (
      <MobileShell showNav={false}>
        <StoreHeader title="支付" backHref="/" />
        <div className="p-4">
          <section className="rounded-xl border border-amber-900/40 bg-amber-950/30 p-4 text-sm text-amber-200">
            缺少联系信息，请从结算页重新提交邮箱与手机号。
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
          <p className="mt-2 text-xs text-[var(--muted)]">
            邮箱：{contactEmail}
            <br />
            手机：{contactPhone}
          </p>
        </section>

        <PayButton
          productId={productId}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
        />

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
