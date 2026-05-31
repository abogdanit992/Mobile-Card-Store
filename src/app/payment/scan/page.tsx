import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { convertUsdToCny, requireCnyAmount } from "@/lib/payments/exchange-rate";
import {
  isItxtProvider,
  resolveItxtPayUrl,
} from "@/lib/payments/itxt-sync";
import { getPaymentChannelConfig } from "@/lib/payments/service";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { ScanPaymentPanel } from "@/components/scan-payment-panel";
import { getTranslations } from "@/lib/i18n/server";

type ScanPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function ScanPaymentPage({ searchParams }: ScanPageProps) {
  const { orderId } = await searchParams;
  const { t } = await getTranslations();

  if (!orderId) {
    redirect("/");
  }

  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id,status,amount")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    redirect("/");
  }

  if (order.status === "paid") {
    redirect(`/cards?orderId=${orderId}`);
  }

  const { data: payment } = await admin
    .from("payments")
    .select("provider,status")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!payment?.provider || !isItxtProvider(payment.provider)) {
    redirect(`/payment/return?orderId=${orderId}`);
  }

  const payUrl = await resolveItxtPayUrl(admin, orderId);
  if (!payUrl) {
    redirect(`/payment/return?orderId=${orderId}`);
  }

  const config = await getPaymentChannelConfig(admin, payment.provider);
  let amountCny = Number(order.amount).toFixed(2);
  if (config) {
    try {
      amountCny = requireCnyAmount(Number(order.amount), config);
    } catch {
      amountCny = convertUsdToCny(Number(order.amount), config.exchange_rate).toFixed(
        2,
      );
    }
  }

  return (
    <MobileShell showNav={false}>
      <StoreHeader
        title={t.scanPayTitle}
        subtitle={t.scanPaySubtitle}
        backHref="/"
        backLabel={t.backHome}
      />

      <div className="px-3 pt-3 pb-8">
        <ScanPaymentPanel
          orderId={orderId}
          payUrl={payUrl}
          amountCny={amountCny}
          provider={payment.provider}
          labels={{
            qrHint: t.scanPayQrHint,
            amount: t.scanPayAmount,
            openApp: t.scanPayOpenApp,
            waiting: t.scanPayWaiting,
            waitingHint: t.scanPayWaitingHint,
            returnLink: t.scanPayReturnLink,
            wechat: t.scanPayWechat,
            alipay: t.scanPayAlipay,
          }}
        />
      </div>
    </MobileShell>
  );
}
