import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  capturePaypalOrder,
} from "@/lib/payments/paypal";
import {
  fulfillPaidOrder,
  getPaypalChannelConfig,
} from "@/lib/payments/service";
import { syncItxtPaymentIfPending, isItxtProvider } from "@/lib/payments/itxt-sync";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { getTranslations } from "@/lib/i18n/server";

type ReturnPageProps = {
  searchParams: Promise<{
    orderId?: string;
    token?: string;
  }>;
};

export default async function PaymentReturnPage({ searchParams }: ReturnPageProps) {
  const { orderId, token } = await searchParams;
  const { t } = await getTranslations();

  if (!orderId) {
    redirect("/");
  }

  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id,status,product_id")
    .eq("id", orderId)
    .maybeSingle();

  const { data: payment } = await admin
    .from("payments")
    .select("provider,status,provider_payment_id")
    .eq("order_id", orderId)
    .maybeSingle();

  // Already paid (webhook completed) -> go to card
  if (order?.status === "paid") {
    redirect(`/cards?orderId=${orderId}`);
  }

  if (payment?.provider === "direct_usdt") {
    redirect(`/payment/usdt?orderId=${orderId}`);
  }

  if (payment?.provider && isItxtProvider(payment.provider) && payment.status !== "paid") {
    const synced = await syncItxtPaymentIfPending(admin, orderId);
    if (synced === "paid") {
      redirect(`/cards?orderId=${orderId}`);
    }
  }

  // PayPal (personal / business / legacy): capture on return
  if (
    payment?.provider &&
    ["paypal", "paypal_personal", "paypal_business"].includes(payment.provider) &&
    payment.status !== "paid"
  ) {
    const paypalOrderId = token ?? payment.provider_payment_id ?? undefined;
    if (paypalOrderId) {
      const config = await getPaypalChannelConfig(admin, payment.provider);
      if (config) {
        try {
          const captured = await capturePaypalOrder(config, paypalOrderId);
          if (captured.status === "paid" && captured.orderId) {
            await fulfillPaidOrder(captured.orderId, paypalOrderId);
            redirect(`/cards?orderId=${captured.orderId}`);
          }
        } catch {
          // fall through to pending UI
        }
      }
    }
  }

  return (
    <MobileShell showNav={false}>
      <StoreHeader title={t.checkout} backHref="/" backLabel={t.backHome} />
      <div className="px-4 pt-6">
        <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/80 text-2xl text-white">
            ⏳
          </div>
          <p className="mt-3 text-sm font-bold text-amber-200">
            {t.loading}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Payment is being confirmed. This page updates automatically once the
            provider confirms your payment.
          </p>
          <Link
            href={`/payment/return?orderId=${orderId}`}
            className="mt-4 inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white"
          >
            Refresh status
          </Link>
        </section>
        <Link
          href={`/cards?orderId=${orderId}`}
          className="mt-3 block text-center text-sm text-[var(--muted)] hover:text-[var(--accent-soft)]"
        >
          {t.queryOrder}
        </Link>
      </div>
    </MobileShell>
  );
}
