import Image from "next/image";
import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { pickLocalized } from "@/lib/i18n/config";
import { safeImageSrc } from "@/lib/img";

function DownloadLink({
  href,
  label,
  variant,
}: {
  href: string | null;
  label: string;
  variant: "primary" | "secondary";
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-lg px-3 py-2 text-center text-xs font-bold ${
        variant === "primary"
          ? "bg-[var(--accent)] text-white"
          : "border border-[var(--border)] text-[var(--muted)] hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}

export default async function DownloadPage() {
  const { locale, t } = await getTranslations();
  const supabase = await createSupabaseServerClient();

  const { data: platforms } = await supabase
    .from("platform_downloads")
    .select(
      "id,category_id,name_en,name_zh,logo_url,android_url,ios_url,cloud_url,download_page,sort_order",
    )
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const apps = platforms ?? [];

  return (
    <MobileShell>
      <StoreHeader
        title={t.downloadTitle}
        subtitle={t.downloadSubtitle}
        backHref="/"
        backLabel={t.backHome}
      />

      <div className="space-y-4 px-3 pt-3">
        <section>
          <h2 className="text-sm font-bold text-white">{t.boxApps}</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{t.boxAppsDesc}</p>
          <ul className="mt-3 space-y-3">
            {apps.map((app) => {
              const name = pickLocalized(locale, app.name_en, app.name_zh);
              const logoSrc = safeImageSrc(app.logo_url);
              return (
                <li
                  key={app.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                >
                  <div className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/40">
                      {logoSrc ? (
                        <Image
                          src={logoSrc}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-2xl">
                          📦
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white">{name}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <DownloadLink
                          href={app.android_url}
                          label="Android"
                          variant="primary"
                        />
                        <DownloadLink href={app.ios_url} label="iOS" variant="secondary" />
                        <DownloadLink
                          href={app.cloud_url}
                          label={t.cloudBackup}
                          variant="secondary"
                        />
                        {app.category_id ? (
                          <Link
                            href={`/?cat=${app.category_id}`}
                            className="rounded-lg border border-[var(--accent-soft)] px-3 py-2 text-center text-xs font-bold text-[var(--accent-soft)]"
                          >
                            {t.buyCard}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </MobileShell>
  );
}
