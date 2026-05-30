"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UsdtPaymentPanelProps = {
  orderId: string;
  walletAddress: string;
  payAmountExact: string;
  expiresAt: string;
  labels: {
    network: string;
    sendExactly: string;
    decimalWarning: string;
    walletAddress: string;
    amount: string;
    copy: string;
    copied: string;
    waiting: string;
    waitingHint: string;
    expired: string;
    expiredHint: string;
    important: string;
    importantHint: string;
  };
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export function UsdtPaymentPanel({
  orderId,
  walletAddress,
  payAmountExact,
  expiresAt,
  labels,
}: UsdtPaymentPanelProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<"address" | "amount" | null>(
    null,
  );
  const [status, setStatus] = useState<"pending" | "paid" | "expired">(
    "pending",
  );
  const [remainingMs, setRemainingMs] = useState(
    () => new Date(expiresAt).getTime() - Date.now(),
  );

  const handleCopy = useCallback(async (field: "address" | "amount", text: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setRemainingMs(new Date(expiresAt).getTime() - Date.now());
    }, 1000);
    return () => window.clearInterval(tick);
  }, [expiresAt]);

  useEffect(() => {
    if (status !== "pending") return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/payments/status?orderId=${orderId}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as { status?: string };
        if (cancelled) return;
        if (json.status === "paid") {
          setStatus("paid");
          router.replace(`/cards?orderId=${orderId}`);
        } else if (json.status === "expired") {
          setStatus("expired");
        }
      } catch {
        // keep polling
      }
    }

    poll();
    const interval = window.setInterval(poll, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [orderId, router, status]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(walletAddress)}`;

  if (status === "expired" || remainingMs <= 0) {
    return (
      <section className="rounded-xl border border-red-900/50 bg-red-950/30 p-5 text-center">
        <p className="text-sm font-bold text-red-300">{labels.expired}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">{labels.expiredHint}</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-[var(--accent)]/50 bg-[var(--card)] p-5 glow-pink">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-soft)]">
          {labels.network}
        </p>

        <div className="mt-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="Wallet QR"
            width={180}
            height={180}
            className="rounded-lg border border-[var(--border)] bg-white p-2"
          />
        </div>

        <p className="mt-4 text-center text-xs font-bold text-amber-200">
          {labels.sendExactly}
        </p>
        <button
          type="button"
          onClick={() => handleCopy("amount", payAmountExact)}
          className="mt-2 w-full break-all rounded-lg border border-[var(--gold)]/50 bg-black/60 p-4 text-center font-mono text-xl font-black tracking-wide text-[var(--gold)] transition hover:border-[var(--gold)] active:scale-[0.99]"
        >
          {payAmountExact} USDT
        </button>
        <p className="mt-1 text-center text-[10px] text-[var(--muted)]">
          {copiedField === "amount" ? labels.copied : labels.amount}
        </p>

        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-600/60 bg-red-950/50 px-3 py-2.5"
        >
          <p className="text-center text-xs font-bold leading-relaxed text-red-300">
            ⚠ {labels.decimalWarning}
          </p>
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          {labels.walletAddress}
        </p>
        <button
          type="button"
          onClick={() => handleCopy("address", walletAddress)}
          className="mt-1 w-full break-all rounded-lg border border-[var(--border)] bg-black/40 p-3 text-left font-mono text-xs text-white transition hover:border-[var(--accent-soft)] active:scale-[0.99]"
        >
          {walletAddress}
        </button>
        <p className="mt-1 text-center text-[10px] text-[var(--muted)]">
          {copiedField === "address" ? labels.copied : labels.copy}
        </p>
      </section>

      <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-center">
        <p className="text-sm font-bold text-amber-200">{labels.waiting}</p>
        <p className="mt-1 font-mono text-lg text-amber-100">
          {formatCountdown(remainingMs)}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">{labels.waitingHint}</p>
      </section>

      <section className="rounded-xl border border-red-900/50 bg-red-950/25 p-4">
        <p className="text-xs font-bold text-red-300">{labels.important}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-red-200/90">
          {labels.importantHint}
        </p>
      </section>
    </div>
  );
}
