import Link from "next/link";
import { AdminLangSwitcher } from "./admin-lang-switcher";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
};

export function AdminPageHeader({
  locale,
  backHref,
  backLabel,
  title,
  subtitle,
  dark = false,
}: Props) {
  return (
    <header className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={backHref}
            className={`text-sm ${dark ? "text-[var(--muted)]" : "text-neutral-500"}`}
          >
            {backLabel}
          </Link>
          <h1
            className={`mt-1 text-2xl font-semibold ${
              dark ? "text-white" : "text-neutral-900"
            }`}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className={`mt-0.5 text-sm ${dark ? "text-[var(--muted)]" : "text-neutral-500"}`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <AdminLangSwitcher locale={locale} />
      </div>
    </header>
  );
}
