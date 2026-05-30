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
        className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={title}
            fill
            unoptimized
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 448px) 50vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-2 text-center">
            <span className="text-4xl drop-shadow-lg">💎</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-sm bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white shadow-lg">
          {badge}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-black text-[var(--gold)] backdrop-blur-sm">
          ⚡
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <p className="line-clamp-2 text-xs font-bold leading-snug text-white">{title}</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-black text-[var(--gold)]">
            {formatPrice(price)}
          </span>
          <span className="rounded-md bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white transition group-hover:brightness-110">
            {getLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
