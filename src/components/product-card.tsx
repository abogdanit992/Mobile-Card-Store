import Image from "next/image";
import Link from "next/link";
import { formatPrice, productBadge, productGradientClass } from "@/lib/format";
import { safeImageSrc } from "@/lib/img";

type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  cover: string | null;
  getLabel?: string;
};

export function ProductCard({
  id,
  title,
  price,
  cover,
  getLabel = "Get",
}: ProductCardProps) {
  const gradient = productGradientClass(title);
  const badge = productBadge(title);
  const coverSrc = safeImageSrc(cover);

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent-soft)] hover:bg-[var(--card-hover)] hover:shadow-[0_0_20px_var(--accent-glow)]"
    >
      <div
        className={`relative aspect-[3/4] overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={title}
            fill
            unoptimized
            className="object-cover opacity-90 transition group-hover:scale-105 group-hover:opacity-100"
            sizes="(max-width: 448px) 50vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-2 text-center">
            <span className="text-4xl drop-shadow-lg">💎</span>
            <span className="mt-2 line-clamp-2 px-1 text-[11px] font-bold uppercase tracking-wide text-white/95">
              {title}
            </span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-sm bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white shadow-lg">
          {badge}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <p className="absolute bottom-2 left-2 right-2 line-clamp-1 text-[11px] font-semibold text-white drop-shadow-md">
          {title}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <p className="text-sm font-black text-[var(--gold)]">{formatPrice(price)}</p>
        <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[9px] font-bold uppercase text-white">
          {getLabel}
        </span>
      </div>
    </Link>
  );
}
