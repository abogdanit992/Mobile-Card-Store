"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/primary-button";

type CheckoutFormProps = {
  productId: string;
  defaultEmail?: string;
  defaultPhone?: string;
  priceLabel: string;
};

export function CheckoutForm({
  productId,
  defaultEmail = "",
  defaultPhone = "",
  priceLabel,
}: CheckoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("contactEmail") ?? "").trim().toLowerCase();
    const phone = String(form.get("contactPhone") ?? "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请填写有效邮箱");
      return;
    }
    if (!phone || phone.length < 6) {
      setError("请填写有效手机号");
      return;
    }

    const params = new URLSearchParams({
      productId,
      contactEmail: email,
      contactPhone: phone,
    });
    router.push(`/payment/success?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">
          联系信息（必填）
        </p>
        <div>
          <label className="text-xs text-[var(--muted)]">邮箱</label>
          <input
            name="contactEmail"
            type="email"
            required
            defaultValue={defaultEmail}
            placeholder="用于注册验证与查单"
            className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)]">手机号（仅联系，不作验证）</label>
          <input
            name="contactPhone"
            type="tel"
            required
            defaultValue={defaultPhone}
            placeholder="+86 13800000000"
            className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </section>

      <PrimaryButton type="submit">去支付 {priceLabel}</PrimaryButton>
    </form>
  );
}
