import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { MobileShell } from "@/components/mobile-shell";
import { PrimaryButton } from "@/components/primary-button";
import { StoreHeader } from "@/components/store-header";
import { getTranslations } from "@/lib/i18n/server";

type CardsPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const { orderId } = await searchParams;
  const { t } = await getTranslations();

  if (!orderId) {
    return (
      <MobileShell>
        <StoreHeader title={t.myCards} backHref="/" />
        <div className="p-4">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
            {t.finishPaymentFirst}
          </section>
        </div>
      </MobileShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,product_id,status,amount")
    .eq("id", orderId)
    .maybeSingle();

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select("id,code,used,used_at")
    .eq("used_order_id", orderId)
    .maybeSingle();

  const errorMessage = orderError?.message || cardError?.message;

  return (
    <MobileShell>
      <StoreHeader title={t.cardDelivery} subtitle={t.keepSafe} backHref="/" />

      <div className="px-3 pt-3">
        {errorMessage ? (
          <section className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">
            {errorMessage}
          </section>
        ) : card ? (
          <section className="rounded-xl border border-[var(--accent)]/50 bg-[var(--card)] p-5 glow-pink">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-soft)]">
              {t.yourVipCode}
            </p>
            <p className="mt-4 break-all rounded-lg border border-[var(--border)] bg-black/60 p-4 text-center font-mono text-lg font-bold tracking-widest text-[var(--gold)]">
              {card.code}
            </p>
            {order ? (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                {t.order} {order.id.slice(0, 8)}… · {formatPrice(order.amount)} · {order.status}
              </p>
            ) : null}
            <p className="mt-4 text-center text-[10px] text-[var(--muted)]">
              {t.saveScreenshot}
            </p>
          </section>
        ) : (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
            {t.cardNotAllocated}
          </section>
        )}

        <div className="mt-5">
          <PrimaryButton href="/">{t.keepShopping}</PrimaryButton>
        </div>
      </div>
    </MobileShell>
  );
}
