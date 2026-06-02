import { formatPrice } from "@/lib/format";
import { MobileShell } from "@/components/mobile-shell";
import { CardCodesList } from "@/components/card-codes-list";
import { PrimaryButton } from "@/components/primary-button";
import { StoreHeader } from "@/components/store-header";
import { getTranslations } from "@/lib/i18n/server";
import {
  contactMatchesOrder,
  fetchOrderCardDelivery,
  fetchOrderForContactVerification,
} from "@/lib/orders/server-access";

type CardsPageProps = {
  searchParams: Promise<{
    orderId?: string;
    email?: string;
    phone?: string;
  }>;
};

function stackHintForCardType(
  cardType: string | null,
  t: {
    cardStackHintQuarterly: string;
    cardStackHintAnnual: string;
  },
): string | null {
  if (cardType === "quarterly") return t.cardStackHintQuarterly;
  if (cardType === "annual") return t.cardStackHintAnnual;
  return null;
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const { orderId, email, phone } = await searchParams;
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

  const normalizedEmail = email?.trim().toLowerCase() || null;
  const normalizedPhone = phone?.trim() || null;
  const hasContact = Boolean(normalizedEmail || normalizedPhone);

  let verifyError: string | null = null;
  let order: Awaited<ReturnType<typeof fetchOrderForContactVerification>> = null;
  let delivery: Awaited<ReturnType<typeof fetchOrderCardDelivery>> = null;

  if (hasContact) {
    order = await fetchOrderForContactVerification(orderId);

    if (!order) {
      verifyError = t.cardVerifyMismatch;
    } else if (!contactMatchesOrder(order, normalizedEmail, normalizedPhone)) {
      verifyError = t.cardVerifyMismatch;
      order = null;
    } else if (order.status !== "paid") {
      verifyError = t.cardOrderNotPaid;
    } else {
      delivery = await fetchOrderCardDelivery(orderId);
    }
  }

  const codes = delivery?.codes ?? [];
  const showStackHint =
    codes.length > 1 && delivery?.stackMonthlyCodes && delivery.cardType;
  const stackHint = showStackHint
    ? stackHintForCardType(delivery!.cardType, t)
    : null;

  return (
    <MobileShell>
      <StoreHeader title={t.cardDelivery} subtitle={t.keepSafe} backHref="/" />

      <div className="px-3 pt-3">
        {!hasContact ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-sm font-bold text-white">{t.cardVerifyTitle}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{t.cardVerifyHint}</p>
            <form className="mt-4 space-y-3" method="get">
              <input type="hidden" name="orderId" value={orderId} />
              <div>
                <label className="text-xs text-[var(--muted)]">{t.email}</label>
                <input
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-base text-white"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)]">{t.phone}</label>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-base text-white"
                />
              </div>
              <p className="text-[10px] text-[var(--muted)]">{t.lookupNeedOne}</p>
              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-bold text-white"
              >
                {t.cardVerifySubmit}
              </button>
            </form>
          </section>
        ) : verifyError ? (
          <section className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">
            {verifyError}
          </section>
        ) : codes.length > 0 ? (
          <section className="rounded-xl border border-[var(--accent)]/50 bg-[var(--card)] p-5 glow-pink">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-soft)]">
              {codes.length > 1 ? t.yourVipCodes : t.yourVipCode}
            </p>

            {stackHint ? (
              <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-950/30 p-3">
                <p className="text-xs font-bold text-amber-200">{t.cardStackHintTitle}</p>
                <p className="mt-2 text-xs leading-relaxed text-amber-100/90">
                  {stackHint}
                </p>
              </div>
            ) : null}

            <CardCodesList
              codes={codes}
              labels={{
                copyCode: t.copyCode,
                copied: t.copied,
                tapToCopy: t.tapToCopy,
                codeNumber: t.cardCodeNumber,
              }}
            />

            {order ? (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                {t.order} {order.id.slice(0, 8)}… · {formatPrice(order.amount)} ·{" "}
                {order.status}
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
