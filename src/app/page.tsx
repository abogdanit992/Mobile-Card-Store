import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MobileShell } from "@/components/mobile-shell";
import { ProductCard } from "@/components/product-card";
import { CategoryNav } from "@/components/category-nav";
import { StoreHeader } from "@/components/store-header";
import { StoreTopLinks } from "@/components/store-top-links";
import { boxAppBySort } from "@/data/platforms";

type HomePageProps = {
  searchParams: Promise<{
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const sort = params.sort ?? "1";
  const activeBrand = boxAppBySort(sort);

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("id,title,description,price,cover,active,created_at,category_sort")
    .eq("active", true)
    .eq("category_sort", sort)
    .order("created_at", { ascending: false });

  const { data: products, error } = await query;

  return (
    <MobileShell>
      <StoreHeader
        title={activeBrand ? `${activeBrand.name}专区` : "精选会员"}
        subtitle="私密开通 · 即时到账"
      />

      <div className="px-3 pt-3">
        <StoreTopLinks />
        <section className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[#2a0f24] via-[#1a0a18] to-black p-4">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--accent)]/20 blur-2xl" />
          <p className="relative text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-soft)]">
            Members Only
          </p>
          <h2 className="relative mt-1 text-base font-black text-white">
            限时 VIP 卡密专区
          </h2>
          <p className="relative mt-1 text-xs text-[var(--muted)]">
            付款即发卡 · 独享通道 · 24h 自动交付
          </p>
        </section>

        <div className="mt-3">
          <CategoryNav activeSort={sort} />
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
                title={product.title}
                price={product.price}
                cover={product.cover}
              />
            ))}
          </section>
        ) : (
          <section className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted)]">
            暂无商品，请先在后台上架
          </section>
        )}
      </div>
    </MobileShell>
  );
}
