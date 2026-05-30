import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pickLocalized, type Locale } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";

export async function AdMarquee({ locale: localeProp }: { locale?: Locale } = {}) {
  const locale = localeProp ?? (await getLocale());
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("ads")
    .select("id,text_en,text_zh,link_url,active,sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const ads = data ?? [];
  if (ads.length === 0) return null;

  const items = ads.map((a) => ({
    id: a.id,
    text: pickLocalized(locale, a.text_en, a.text_zh),
    link: a.link_url,
  }));

  const Track = () => (
    <div className="marquee-track" aria-hidden>
      {items.map((it) => (
        <span key={it.id} className="mx-5 inline-flex items-center gap-2 text-sm font-bold">
          <span className="text-[var(--gold)]">★</span>
          {it.link ? (
            <Link href={it.link} className="text-white hover:text-[var(--accent-soft)]">
              {it.text}
            </Link>
          ) : (
            <span className="text-white">{it.text}</span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative flex items-stretch overflow-hidden rounded-lg border border-[var(--accent)]/40 bg-gradient-to-r from-[#3a0f2a] via-[#27122e] to-[#1a0a18] shadow-[0_0_18px_var(--accent-glow)]">
      <span className="z-10 flex shrink-0 items-center bg-[var(--accent)] px-2.5 text-base text-white">
        📣
      </span>
      <div className="marquee-viewport flex-1 py-2">
        <div className="marquee-content">
          <Track />
          <Track />
        </div>
      </div>
    </div>
  );
}
