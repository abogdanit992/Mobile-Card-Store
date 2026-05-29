import Link from "next/link";
import type { Dict } from "@/lib/i18n/dictionaries";

const HUB_PRIMARY = "https://juhe.live";
const HUB_BACKUP = "http://103.236.57.111:8090";

export function StoreTopLinks({ t }: { t: Dict }) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 text-[10px] font-bold [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/download"
        className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white"
      >
        {t.softwareDownload}
      </Link>
      <a
        href={HUB_PRIMARY}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white"
      >
        {t.hubDownload}
      </a>
      <a
        href={HUB_BACKUP}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white"
      >
        {t.backupDownload}
      </a>
      <Link
        href="/orders/lookup"
        className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white"
      >
        {t.queryOrder}
      </Link>
    </nav>
  );
}
