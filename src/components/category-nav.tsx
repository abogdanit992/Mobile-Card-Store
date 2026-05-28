import Image from "next/image";
import Link from "next/link";
import { boxApps } from "@/data/platforms";

type CategoryNavProps = {
  activeSort: string;
};

export function CategoryNav({ activeSort }: CategoryNavProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {boxApps.map((app) => {
        const href = app.sort === "1" ? "/?sort=1" : `/?sort=${app.sort}`;
        const active = activeSort === app.sort;

        return (
          <Link
            key={app.slug}
            href={href}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
              active
                ? "border-[var(--accent-soft)] bg-[var(--card-hover)]"
                : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent-soft)]"
            }`}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-black/40">
              <Image
                src={app.categoryLogo}
                alt={app.name}
                fill
                className="object-cover"
                sizes="40px"
                unoptimized
              />
            </div>
            <span
              className={`text-[10px] font-bold ${
                active ? "text-[var(--accent-soft)]" : "text-[var(--muted)]"
              }`}
            >
              {app.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
