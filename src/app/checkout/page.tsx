import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/user";
import { formatPrice } from "@/lib/format";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { CheckoutForm } from "./checkout-form";

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
  const user = await getCurrentUser();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,title,price,active")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  let profilePhone: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();
    profilePhone = profile?.phone ?? null;
  }

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

      <div className="space-y-3 px-3 pt-3 pb-8">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">
            订单信息
          </p>
          <h2 className="mt-2 text-lg font-bold text-white">{product.title}</h2>
          <p className="mt-2 text-2xl font-black text-[var(--gold)]">
            {formatPrice(product.price)}
          </p>
        </section>

        <CheckoutForm
          productId={product.id}
          defaultEmail={user?.email ?? ""}
          defaultPhone={profilePhone ?? ""}
          priceLabel={formatPrice(product.price)}
        />
      </div>
    </MobileShell>
  );
}
