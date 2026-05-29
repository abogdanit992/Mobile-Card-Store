import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/config";

export type CategoryNavItem = {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  icon_url: string | null;
};

type CategoryNavProps = {
  categories: CategoryNavItem[];
  activeId: string | null;
  locale: Locale;
};

export function CategoryNav({ categories, activeId, locale }: CategoryNavProps) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((cat) => {
        const active = activeId === cat.id;
        const name = pickLocalized(locale, cat.name_en, cat.name_zh, cat.slug);

        return (
          <Link
            key={cat.id}
            href={`/?cat=${cat.id}`}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
              active
                ? "border-[var(--accent-soft)] bg-[var(--card-hover)]"
                : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent-soft)]"
            }`}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-black/40">
              {cat.icon_url ? (
                <Image
                  src={cat.icon_url}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="40px"
                  unoptimized
                />
              ) : (
                <span className="flex h-full items-center justify-center text-lg">
                  💎
                </span>
              )}
            </div>
            <span
              className={`line-clamp-1 text-[10px] font-bold ${
                active ? "text-[var(--accent-soft)]" : "text-[var(--muted)]"
              }`}
            >
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
