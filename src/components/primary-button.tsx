import Link from "next/link";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  href?: string;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function PrimaryButton({
  href,
  children,
  className = "",
  type = "button",
  disabled,
  onClick,
}: PrimaryButtonProps) {
  const styles = `flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--accent)] via-rose-500 to-fuchsia-600 text-sm font-black uppercase tracking-wide text-white glow-pink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={styles}
    >
      {children}
    </button>
  );
}
