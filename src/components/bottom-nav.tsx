import Link from "next/link";
import { getTranslations } from "@/lib/i18n/server";

const HOME_ICON =
  "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1";
const DOWNLOAD_ICON =
  "M12 4v12m0 0l-4-4m4 4l4-4M4 20h16";
const QUERY_ICON = "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z";

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export async function BottomNav() {
  const { t } = await getTranslations();
  const items = [
    { href: "/", label: t.navHome, icon: HOME_ICON },
    { href: "/download", label: t.softwareDownload, icon: DOWNLOAD_ICON },
    { href: "/orders/lookup", label: t.navQuery, icon: QUERY_ICON },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-[var(--border)] bg-[#0c0612]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg">
      <div className="grid grid-cols-3 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[10px] font-bold text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-[var(--accent-soft)]"
          >
            <NavIcon d={item.icon} />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
