import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pickLocalized, type Locale } from "@/lib/i18n/config";

const linkClass =
  "shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] hover:text-white";

export async function StoreTopLinks({ locale }: { locale: Locale }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("quick_links")
    .select("id,label_en,label_zh,url,is_external")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const links = data ?? [];
  if (links.length === 0) return null;

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 text-[10px] font-bold [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {links.map((l) => {
        const label = pickLocalized(locale, l.label_en, l.label_zh);
        return l.is_external ? (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {label}
          </a>
        ) : (
          <Link key={l.id} href={l.url} className={linkClass}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
