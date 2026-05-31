"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ScanPaymentPanelProps = {
  orderId: string;
  payUrl: string;
  amountCny: string;
  provider: "wechat" | "alipay";
  labels: {
    qrHint: string;
    amount: string;
    openApp: string;
    waiting: string;
    waitingHint: string;
    returnLink: string;
    wechat: string;
    alipay: string;
  };
};

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function ScanPaymentPanel({
  orderId,
  payUrl,
  amountCny,
  provider,
  labels,
}: ScanPaymentPanelProps) {
  const router = useRouter();
  const [mobile] = useState(isMobileDevice);
  const providerLabel = provider === "wechat" ? labels.wechat : labels.alipay;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payUrl)}`;

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/payments/status?orderId=${orderId}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as { status?: string };
        if (cancelled) return;
        if (json.status === "paid") {
          router.replace(`/cards?orderId=${orderId}`);
        }
      } catch {
        // keep polling
      }
    }

    poll();
    const interval = window.setInterval(poll, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [orderId, router]);

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-[var(--accent)]/50 bg-[var(--card)] p-5 glow-pink">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-soft)]">
          {providerLabel}
        </p>

        <p className="mt-4 text-center text-3xl font-black text-[var(--gold)]">
          ¥{amountCny}
        </p>
        <p className="mt-1 text-center text-[10px] text-[var(--muted)]">
          {labels.amount}
        </p>

        {!mobile ? (
          <>
            <div className="mt-5 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Payment QR"
                width={220}
                height={220}
                className="rounded-lg border border-[var(--border)] bg-white p-2"
              />
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
              {labels.qrHint}
            </p>
          </>
        ) : null}

        <a
          href={payUrl}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#1677ff] text-sm font-bold text-white transition hover:opacity-90"
        >
          {labels.openApp}
        </a>
      </section>

      <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-center">
        <p className="text-sm font-bold text-amber-200">{labels.waiting}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">{labels.waitingHint}</p>
      </section>

      <Link
        href={`/payment/return?orderId=${orderId}`}
        className="block text-center text-sm text-[var(--muted)] hover:text-[var(--accent-soft)]"
      >
        {labels.returnLink}
      </Link>
    </div>
  );
}
