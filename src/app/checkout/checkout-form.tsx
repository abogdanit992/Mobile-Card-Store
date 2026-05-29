"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/primary-button";

type Provider = "cryptomus" | "stripe" | "paypal";

type ChannelOption = {
  provider: Provider;
  label: string;
};

type CheckoutLabels = {
  contactInfo: string;
  contactInfoHint: string;
  emailOptional: string;
  phoneOptional: string;
  emailHint: string;
  phoneHint: string;
  atLeastOneContact: string;
  selectPayment: string;
  noPaymentChannels: string;
  pay: string;
  payWith: string;
  invalidEmail: string;
  selectChannelFirst: string;
  loading: string;
};

type CheckoutFormProps = {
  productId: string;
  defaultEmail?: string;
  defaultPhone?: string;
  priceLabel: string;
  channels: ChannelOption[];
  labels: CheckoutLabels;
};

const PROVIDER_ICON: Record<Provider, string> = {
  cryptomus: "₿",
  stripe: "💳",
  paypal: "🅿️",
};

export function CheckoutForm({
  productId,
  defaultEmail = "",
  defaultPhone = "",
  priceLabel,
  channels,
  labels,
}: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<Provider | null>(
    channels[0]?.provider ?? null,
  );
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanEmail && !cleanPhone) {
      setError(labels.atLeastOneContact);
      return;
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError(labels.invalidEmail);
      return;
    }
    if (!selected) {
      setError(labels.selectChannelFirst);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          contactEmail: cleanEmail,
          contactPhone: cleanPhone,
          provider: selected,
        }),
      });
      const result = (await res.json()) as
        | { ok: true; redirectUrl: string }
        | { error: string };

      if (!res.ok || !("ok" in result)) {
        setError("error" in result ? result.error : "Payment failed.");
        return;
      }
      window.location.href = result.redirectUrl;
    } catch {
      setError("Network error, please retry.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <section className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">
          {labels.contactInfo}
        </p>
        <p className="text-xs text-[var(--muted)]">{labels.contactInfoHint}</p>
        <div>
          <label className="text-xs text-[var(--muted)]">{labels.emailOptional}</label>
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.emailHint}
            className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)]">{labels.phoneOptional}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={labels.phoneHint}
            className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
          />
        </div>
      </section>

      <section className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">
          {labels.selectPayment}
        </p>
        {channels.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{labels.noPaymentChannels}</p>
        ) : (
          <div className="space-y-2">
            {channels.map((ch) => (
              <button
                type="button"
                key={ch.provider}
                onClick={() => setSelected(ch.provider)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-semibold transition ${
                  selected === ch.provider
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-white"
                    : "border-[var(--border)] text-[var(--muted)] hover:text-white"
                }`}
              >
                <span className="text-lg">{PROVIDER_ICON[ch.provider]}</span>
                <span className="flex-1">{ch.label}</span>
                <span
                  className={`h-4 w-4 rounded-full border ${
                    selected === ch.provider
                      ? "border-[var(--accent)] bg-[var(--accent)]"
                      : "border-[var(--border)]"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isLoading || channels.length === 0}>
        {isLoading ? labels.loading : `${labels.pay} ${priceLabel}`}
      </PrimaryButton>
    </form>
  );
}
