import Link from "next/link";
import type { ReactNode } from "react";

type StoreHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  brand?: string;
  rightSlot?: ReactNode;
};

export function StoreHeader({
  title,
  subtitle,
  backHref,
  backLabel = "返回",
  brand = "VIP Lounge",
  rightSlot,
}: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#0c0612]/95 px-4 py-3 backdrop-blur-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {backHref ? (
            <Link
              href={backHref}
              className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent-soft)]"
            >
              <span aria-hidden>←</span> {backLabel}
            </Link>
          ) : (
            <p className="text-glow text-[10px] font-black uppercase tracking-[0.25em] text-[var(--accent-soft)]">
              {brand}
            </p>
          )}
          <h1 className="text-lg font-bold text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0 pt-0.5">{rightSlot}</div> : null}
      </div>
    </header>
  );
}
