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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const result = (await response.json()) as
        | { ok: true; orderId: string; productId: string }
        | { error: string };

      if (!response.ok || !("ok" in result)) {
        setError(result.error || "Payment confirmation failed.");
        return;
      }

      router.push(`/cards?orderId=${result.orderId}`);
    } catch {
      setError("Network error. Please retry.");
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
        className="flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Processing..." : "Confirm and Deliver Card"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
