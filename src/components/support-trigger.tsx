"use client";

import { useRouter } from "next/navigation";

type TawkApi = { maximize?: () => void; toggle?: () => void };

type Props = {
  className?: string;
  children: React.ReactNode;
  /** Where to go when the Tawk widget isn't available. */
  fallbackHref: string;
};

/**
 * Opens the Tawk.to chat if it's loaded on the page; otherwise navigates to
 * the configured fallback (an alternative chat link or the /support page).
 */
export function SupportTrigger({ className, children, fallbackHref }: Props) {
  const router = useRouter();

  function open() {
    if (typeof window !== "undefined") {
      const api = (window as unknown as { Tawk_API?: TawkApi }).Tawk_API;
      if (api && typeof api.maximize === "function") {
        api.maximize();
        return;
      }
    }
    if (/^https?:\/\//i.test(fallbackHref)) {
      window.open(fallbackHref, "_blank", "noopener,noreferrer");
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
