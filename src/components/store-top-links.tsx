import Link from "next/link";
import { DOWNLOAD_HUB_BACKUP, DOWNLOAD_HUB_PRIMARY } from "@/data/platforms";

export function StoreTopLinks() {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 text-[10px] font-bold [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/download"
        className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white"
      >
        软件下载
      </Link>
      <a
        href={DOWNLOAD_HUB_PRIMARY}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white"
      >
        聚合下载
      </a>
      <a
        href={DOWNLOAD_HUB_BACKUP}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white"
      >
        备用下载
      </a>
      <Link
        href="/orders/lookup"
        className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white"
      >
        查询订单
      </Link>
    </nav>
  );
}
