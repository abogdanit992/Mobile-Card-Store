import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatExactUsdt } from "@/lib/payments/direct-usdt";
import { getEnabledChannelConfig } from "@/lib/payments/service";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { UsdtPaymentPanel } from "@/components/usdt-payment-panel";
import { getTranslations } from "@/lib/i18n/server";

type UsdtPaymentPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function UsdtPaymentPage({ searchParams }: UsdtPaymentPageProps) {
  const { orderId } = await searchParams;
  const { t } = await getTranslations();

  if (!orderId) {
    redirect("/");
  }

  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id,status,pay_amount_exact,expires_at,amount")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    redirect("/");
  }

  if (order.status === "paid") {
    redirect(`/cards?orderId=${orderId}`);
  }

  if (
    order.expires_at &&
    new Date(order.expires_at).getTime() < Date.now()
  ) {
    redirect(`/checkout`);
  }

  if (!order.pay_amount_exact) {
    redirect("/");
  }

  const config = await getEnabledChannelConfig(admin, "direct_usdt");
  const walletAddress = config?.wallet_address?.trim();
  if (!walletAddress) {
    return (
      <MobileShell showNav={false}>
        <StoreHeader title={t.usdtPayTitle} backHref="/" backLabel={t.backHome} />
        <div className="p-4 text-sm text-red-300">{t.usdtNotConfigured}</div>
      </MobileShell>
    );
  }

  const payAmountExact = formatExactUsdt(Number(order.pay_amount_exact));

  return (
    <MobileShell showNav={false}>
      <StoreHeader
        title={t.usdtPayTitle}
        subtitle={t.usdtPaySubtitle}
        backHref="/"
        backLabel={t.backHome}
      />

      <div className="px-3 pt-3 pb-8">
        <UsdtPaymentPanel
          orderId={orderId}
          walletAddress={walletAddress}
          payAmountExact={payAmountExact}
          expiresAt={order.expires_at ?? new Date(Date.now() + 1_800_000).toISOString()}
          labels={{
            network: t.usdtNetwork,
            sendExactly: t.usdtSendExactly,
            decimalWarning: t.usdtDecimalWarning,
            walletAddress: t.usdtWalletAddress,
            amount: t.tapToCopy,
            copy: t.copyCode,
            copied: t.copied,
            waiting: t.usdtWaiting,
            waitingHint: t.usdtWaitingHint,
            expired: t.usdtExpired,
            expiredHint: t.usdtExpiredHint,
            important: t.usdtImportant,
            importantHint: t.usdtImportantHint,
          }}
        />
      </div>
    </MobileShell>
  );
}
