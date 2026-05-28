import Link from "next/link";

const options = [
  { sort: "1", label: "最新" },
  { sort: "2", label: "低价" },
  { sort: "3", label: "高价" },
] as const;

type SortPillsProps = {
  active: string;
  basePath?: string;
};

export function SortPills({ active, basePath = "/" }: SortPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((option) => {
        const isActive = active === option.sort;
        const href =
          option.sort === "1" ? basePath : `${basePath}?sort=${option.sort}`;

        return (
          <Link
            key={option.sort}
            href={href}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              isActive
                ? "bg-[var(--accent)] text-white glow-pink"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--accent-soft)] hover:text-white"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
