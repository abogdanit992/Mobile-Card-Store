import { redirect } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { SupportTrigger } from "@/components/support-trigger";
import { getSupportSettings, isValidTawkSrc } from "@/lib/support";
import { getTranslations } from "@/lib/i18n/server";

export default async function SupportPage() {
  const { t } = await getTranslations();
  const { tawkSrc, supportUrl } = await getSupportSettings();

  // A non-Tawk external chat link takes priority: jump straight to it.
  if (!isValidTawkSrc(tawkSrc) && /^https?:\/\//i.test(supportUrl)) {
    redirect(supportUrl);
  }

  return (
    <MobileShell>
      <StoreHeader
        title={t.supportTitle}
        subtitle={t.navService}
        backHref="/"
        backLabel={t.backHome}
      />
      <div className="px-3 pt-6">
        {isValidTawkSrc(tawkSrc) ? (
          <SupportTrigger
            fallbackHref="/support"
            className="block w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-bold text-white"
          >
            {t.supportTitle}
          </SupportTrigger>
        ) : (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted)]">
            {t.supportUnavailable}
          </p>
        )}
      </div>
    </MobileShell>
  );
}
