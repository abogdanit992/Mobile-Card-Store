import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MobileShell } from "@/components/mobile-shell";
import { ProductCard } from "@/components/product-card";
import { CategoryNav } from "@/components/category-nav";
import { StoreHeader } from "@/components/store-header";
import { StoreTopLinks } from "@/components/store-top-links";
import { AdMarquee } from "@/components/ad-marquee";
import { getHomeContent } from "@/lib/site-content";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocale } from "@/lib/i18n/server";
import { getSiteLanguageSettings } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pickLocalized } from "@/lib/i18n/config";

type HomePageProps = {
  searchParams: Promise<{
    cat?: string;
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const langSettings = await getSiteLanguageSettings();
  const t = getDictionary(locale);
  const home = await getHomeContent(locale);

  const supabase = await createSupabaseServerClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id,slug,name_en,name_zh,icon_url")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const cats = categories ?? [];
  const activeCat = params.cat && cats.some((c) => c.id === params.cat)
    ? params.cat
    : (cats[0]?.id ?? null);

  let query = supabase
    .from("products")
    .select("id,title,name_en,name_zh,price,cover,category_id,active,created_at")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (activeCat) {
    query = query.eq("category_id", activeCat);
  }

  const { data: products, error } = await query;
  const activeCatName = cats.find((c) => c.id === activeCat);

  return (
    <MobileShell>
      <StoreHeader
        title={
          activeCatName
            ? pickLocalized(locale, activeCatName.name_en, activeCatName.name_zh)
            : t.featured
        }
        subtitle={home.tagline}
        rightSlot={
          <LanguageSwitcher locale={locale} enabled={langSettings.enabled} />
        }
      />

      <div className="px-3 pt-3">
        <div className="mb-3">
          <AdMarquee locale={locale} />
        </div>

        <StoreTopLinks locale={locale} />

        {home.heroEnabled ? (
          <section className="relative mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[#2a0f24] via-[#1a0a18] to-black p-4">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--accent)]/20 blur-2xl" />
            <p className="relative text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-soft)]">
              {home.heroEyebrow}
            </p>
            <h2 className="relative mt-1 text-base font-black text-white">
              {home.heroTitle}
            </h2>
            <p className="relative mt-1 text-xs text-[var(--muted)]">{home.heroDesc}</p>
          </section>
        ) : null}

        <div className="mt-3">
          <CategoryNav categories={cats} activeId={activeCat} locale={locale} />
        </div>

        {error ? (
          <section className="mt-3 rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">
            {error.message}
          </section>
        ) : products && products.length > 0 ? (
          <section className="mt-3 grid grid-cols-2 gap-2.5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={pickLocalized(locale, product.name_en, product.name_zh, product.title)}
                price={product.price}
                cover={product.cover}
                getLabel={t.get}
              />
            ))}
          </section>
        ) : (
          <section className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted)]">
            {t.noProducts}
          </section>
        )}
      </div>
    </MobileShell>
  );
}
