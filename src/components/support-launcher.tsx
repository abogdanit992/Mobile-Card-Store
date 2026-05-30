"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type TawkApi = {
  maximize?: () => void;
  showWidget?: () => void;
};

type Labels = {
  /** Title shown on the chooser sheet. */
  title: string;
  /** Web live-chat (Tawk) option label. */
  webChat: string;
  whatsapp: string;
  cancel: string;
};

type Props = {
  className?: string;
  children: React.ReactNode;
  /** Whether a Tawk.to widget is configured on the page. */
  tawkAvailable: boolean;
  /** WhatsApp link (wa.me/…), empty if not configured. */
  whatsappUrl?: string;
  /** Where to go when neither Tawk nor WhatsApp is available. */
  fallbackHref: string;
  labels: Labels;
};

const WHATSAPP_ICON =
  "M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.157 5.335 5.493 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.599 5.39l-.999 3.648 3.738-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z";

function openTawk(): boolean {
  if (typeof window === "undefined") return false;
  const api = (window as unknown as { Tawk_API?: TawkApi }).Tawk_API;
  if (!api || typeof api.maximize !== "function") return false;
  try {
    api.showWidget?.();
    api.maximize();
    return true;
  } catch {
    return false;
  }
}

function openWhatsApp(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Single support entry point. Depending on what's configured it either opens
 * the Tawk.to chat, opens WhatsApp, shows a chooser when both exist, or falls
 * back to a link/page. No floating bubbles are ever shown.
 */
export function SupportLauncher({
  className,
  children,
  tawkAvailable,
  whatsappUrl,
  fallbackHref,
  labels,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const hasWhatsApp = !!whatsappUrl && /^https?:\/\//i.test(whatsappUrl);

  function handleClick() {
    if (tawkAvailable && hasWhatsApp) {
      setOpen(true);
      return;
    }
    if (tawkAvailable) {
      if (openTawk()) return;
    }
    if (hasWhatsApp) {
      openWhatsApp(whatsappUrl!);
      return;
    }
    if (/^https?:\/\//i.test(fallbackHref)) {
      window.open(fallbackHref, "_blank", "noopener,noreferrer");
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[#140b1d] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex justify-center">
              <Image
                src="/brand/support.png"
                alt={labels.title}
                width={512}
                height={512}
                className="h-16 w-16 drop-shadow-[0_0_18px_rgba(255,30,86,0.4)]"
              />
            </div>
            <p className="mb-3 text-center text-sm font-bold text-white">
              {labels.title}
            </p>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (!openTawk()) router.push("/support");
              }}
              className="mb-2 flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </span>
              {labels.webChat}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-semibold text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={WHATSAPP_ICON} />
                </svg>
              </span>
              {labels.whatsapp}
            </a>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-xl px-4 py-2 text-center text-xs font-semibold text-[var(--muted)]"
            >
              {labels.cancel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
