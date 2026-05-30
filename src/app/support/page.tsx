import Image from "next/image";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { SupportLauncher } from "@/components/support-launcher";
import { getSupportSettings, isValidTawkSrc } from "@/lib/support";
import { getTranslations } from "@/lib/i18n/server";

export default async function SupportPage() {
  const { t } = await getTranslations();
  const { tawkSrc, supportUrl, whatsappUrl } = await getSupportSettings();
  const tawkAvailable = isValidTawkSrc(tawkSrc);
  const hasWhatsApp = /^https?:\/\//i.test(whatsappUrl);

  // A non-Tawk external chat link takes priority when nothing else is set:
  // jump straight to it.
  if (!tawkAvailable && !hasWhatsApp && /^https?:\/\//i.test(supportUrl)) {
    redirect(supportUrl);
  }

  const hasAnyChannel = tawkAvailable || hasWhatsApp;

  return (
    <MobileShell>
      <StoreHeader
        title={t.supportTitle}
        subtitle={t.navService}
        backHref="/"
        backLabel={t.backHome}
      />
      <div className="px-3 pt-6">
        <div className="mb-5 flex justify-center">
          <Image
            src="/brand/support.png"
            alt={t.supportTitle}
            width={512}
            height={512}
            className="h-28 w-28 drop-shadow-[0_0_24px_rgba(255,30,86,0.35)]"
          />
        </div>
        {hasAnyChannel ? (
          <SupportLauncher
            fallbackHref="/support"
            tawkAvailable={tawkAvailable}
            whatsappUrl={whatsappUrl}
            className="block w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-bold text-white"
            labels={{
              title: t.supportChooseTitle,
              webChat: t.supportWebChat,
              whatsapp: t.supportWhatsApp,
              cancel: t.supportCancel,
            }}
          >
            {t.supportTitle}
          </SupportLauncher>
        ) : (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted)]">
            {t.supportUnavailable}
          </p>
        )}
      </div>
    </MobileShell>
  );
}
