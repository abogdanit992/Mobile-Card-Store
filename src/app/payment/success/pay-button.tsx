"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PayButtonProps = {
  productId: string;
};

export function PayButton({ productId }: PayButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const result = (await response.json()) as
        | { ok: true; orderId: string; productId: string }
        | { error: string };

      if (!response.ok) {
        setError("error" in result ? result.error : "发卡失败，请重试");
        return;
      }

      if (!("ok" in result)) {
        setError("发卡失败，请重试");
        return;
      }

      router.push(`/cards?orderId=${result.orderId}`);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--accent)] via-rose-500 to-fuchsia-600 text-sm font-black uppercase tracking-wide text-white glow-pink transition hover:brightness-110 disabled:opacity-50"
      >
        {isLoading ? "正在发卡…" : "立即领取卡密"}
      </button>
      {error ? (
        <p className="mt-2 text-center text-sm text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
