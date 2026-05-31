import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/user";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { CheckoutForm } from "./checkout-form";
import { getTranslations } from "@/lib/i18n/server";
import { pickLocalized } from "@/lib/i18n/config";

type CheckoutPageProps = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { productId } = await searchParams;
  const { locale, t } = await getTranslations();

  if (!productId) {
    return (
      <MobileShell showNav={false}>
        <StoreHeader title={t.checkout} backHref="/" backLabel={t.back} />
        <div className="p-4">
          <section className="rounded-xl border border-amber-900/40 bg-amber-950/30 p-4 text-sm text-amber-200">
            {t.noProducts}
          </section>
        </div>
      </MobileShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,title,name_en,name_zh,price,active")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  const { data: channels } = await supabase
    .from("payment_channels_public")
    .select("id,provider,label_en,label_zh,sort_order,exchange_rate")
    .order("sort_order", { ascending: true });

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
        <StoreHeader title={t.checkout} backHref="/" backLabel={t.back} />
        <div className="p-4">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
            {error?.message ?? t.noProducts}
          </section>
        </div>
      </MobileShell>
    );
  }

  const productName = pickLocalized(locale, product.name_en, product.name_zh, product.title);
  const paymentChannels = (channels ?? []).map((c) => ({
    provider: c.provider,
    label: pickLocalized(locale, c.label_en, c.label_zh, c.provider),
    exchangeRate: c.exchange_rate ?? null,
  }));

  return (
    <MobileShell showNav={false}>
      <StoreHeader
        title={t.confirmOrder}
        backHref={`/products/${product.id}`}
        backLabel={t.back}
      />

      <div className="space-y-3 px-3 pt-3 pb-8">
        <CheckoutForm
          productId={product.id}
          productName={productName}
          priceUsd={Number(product.price)}
          defaultEmail={user?.email ?? ""}
          defaultPhone={profilePhone ?? ""}
          channels={paymentChannels}
          labels={{
            orderInfo: t.orderInfo,
            contactInfo: t.contactInfo,
            contactInfoHint: t.contactInfoHint,
            emailOptional: t.emailOptional,
            phoneOptional: t.phoneOptional,
            emailHint: t.emailHint,
            phoneHint: t.phoneHint,
            atLeastOneContact: t.atLeastOneContact,
            selectPayment: t.selectPayment,
            noPaymentChannels: t.noPaymentChannels,
            pay: t.pay,
            payWith: t.payWith,
            invalidEmail: t.invalidEmail,
            selectChannelFirst: t.selectChannelFirst,
            loading: t.loading,
            usdReference: t.usdReference,
            cnyRateHint: t.cnyRateHint,
            cnyRateMissing: t.cnyRateMissing,
          }}
        />
      </div>
    </MobileShell>
  );
}
