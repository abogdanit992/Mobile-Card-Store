import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice, productBadge, productGradientClass } from "@/lib/format";
import { MobileShell } from "@/components/mobile-shell";
import { PrimaryButton } from "@/components/primary-button";
import { StoreHeader } from "@/components/store-header";
import { getTranslations } from "@/lib/i18n/server";
import { pickLocalized } from "@/lib/i18n/config";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const { locale, t } = await getTranslations();
  const supabase = await createSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,title,name_en,name_zh,description,description_en,description_zh,price,cover,active")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return (
      <MobileShell showNav={false}>
        <div className="p-4">
          <section className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">
            {error.message}
          </section>
        </div>
      </MobileShell>
    );
  }

  if (!product) {
    notFound();
  }

  const productName = pickLocalized(locale, product.name_en, product.name_zh, product.title);
  const productDesc = pickLocalized(
    locale,
    product.description_en,
    product.description_zh,
    product.description ?? "",
  );
  const gradient = productGradientClass(product.title);
  const badge = productBadge(product.title);

  return (
    <MobileShell showNav={false}>
      <StoreHeader title={productName} backHref="/" backLabel={t.back} />

      <div className="px-3 pb-28">
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className={`relative aspect-[4/5] bg-gradient-to-br ${gradient}`}>
            {product.cover ? (
              <Image
                src={product.cover}
                alt={productName}
                fill
                className="object-cover"
                sizes="448px"
                priority
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-white">
                <span className="text-6xl">💎</span>
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white/80">
                  VIP Access
                </p>
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-sm bg-[var(--accent)] px-2 py-1 text-[10px] font-black text-white">
              {badge}
            </span>
          </div>

          <div className="space-y-3 p-4">
            <p className="text-3xl font-black text-[var(--gold)]">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {productDesc ||
                (locale === "zh"
                  ? "付款后自动发放独享卡密，复制即可激活会员。私密、快速、稳定。"
                  : "An exclusive card code is delivered instantly after payment. Copy it to activate. Private, fast, reliable.")}
            </p>
            <ul className="space-y-1 text-xs text-[var(--muted)]">
              <li>{locale === "zh" ? "🔥 即时自动发卡" : "🔥 Instant auto delivery"}</li>
              <li>{locale === "zh" ? "🔒 独享卡密不重复" : "🔒 Unique, non-reused codes"}</li>
              <li>{locale === "zh" ? "⚡ 7×24 秒级到账" : "⚡ 24/7 delivery in seconds"}</li>
            </ul>
          </div>
        </section>

        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-[var(--border)] bg-[#0c0612]/95 p-3 backdrop-blur-md">
          <PrimaryButton href={`/checkout?productId=${product.id}`}>
            {t.buyNow} {formatPrice(product.price)}
          </PrimaryButton>
        </div>
      </div>
    </MobileShell>
  );
}
