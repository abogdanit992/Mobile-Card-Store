import Link from "next/link";

type StoreHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

export function StoreHeader({
  title,
  subtitle,
  backHref,
  backLabel = "返回",
}: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#0c0612]/95 px-4 py-3 backdrop-blur-md">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent-soft)]"
        >
          <span aria-hidden>←</span> {backLabel}
        </Link>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div>
          {!backHref ? (
            <p className="text-glow text-[10px] font-black uppercase tracking-[0.25em] text-[var(--accent-soft)]">
              VIP Lounge
            </p>
          ) : null}
          <h1 className="text-lg font-bold text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        {!backHref ? (
          <Link
            href="/admin"
            className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[10px] font-bold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-soft)]"
          >
            管理
          </Link>
        ) : null}
      </div>
    </header>
  );
}
