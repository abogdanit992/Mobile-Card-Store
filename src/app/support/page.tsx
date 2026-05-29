import { redirect } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";

export default async function SupportPage() {
  const { t } = await getTranslations();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "support_chat_url")
    .maybeSingle();

  const url = typeof data?.value === "string" ? data.value.trim() : "";

  if (/^https?:\/\//i.test(url)) {
    redirect(url);
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
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-bold text-white"
          >
            {t.supportTitle}
          </a>
        ) : (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted)]">
            {t.supportUnavailable}
          </p>
        )}
      </div>
    </MobileShell>
  );
}
