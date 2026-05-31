"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/primary-button";

import type { Provider } from "@/lib/payments/types";
import {
  convertUsdToCny,
  formatCnyPrice,
  isCnyCheckoutProvider,
  parseExchangeRate,
} from "@/lib/payments/exchange-rate";
import { formatPrice } from "@/lib/format";

type ChannelOption = {
  provider: Provider;
  label: string;
  exchangeRate?: string | null;
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
  orderInfo: string;
  usdReference: string;
  cnyRateHint: string;
  cnyRateMissing: string;
};

type CheckoutFormProps = {
  productId: string;
  productName: string;
  priceUsd: number;
  defaultEmail?: string;
  defaultPhone?: string;
  channels: ChannelOption[];
  labels: CheckoutLabels;
};

const PROVIDER_ICON: Partial<Record<Provider, string>> = {
  cryptomus: "₿",
  nowpayments: "🪙",
  stripe: "💳",
  paypal: "🅿️",
  paypal_personal: "🅿️",
  paypal_business: "🏢",
  direct_usdt: "💵",
  wechat: "💬",
  alipay: "🔵",
};

function providerIcon(provider: Provider): string {
  return PROVIDER_ICON[provider] ?? "💰";
}

function channelPayLabel(
  provider: Provider,
  priceUsd: number,
  exchangeRate?: string | null,
): string | null {
  if (!isCnyCheckoutProvider(provider)) return null;
  const rate = parseExchangeRate(exchangeRate);
  if (!rate) return null;
  return formatCnyPrice(convertUsdToCny(priceUsd, exchangeRate));
}

export function CheckoutForm({
  productId,
  productName,
  priceUsd,
  defaultEmail = "",
  defaultPhone = "",
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

  const selectedChannel = channels.find((c) => c.provider === selected);
  const selectedUsesCny =
    selected != null && isCnyCheckoutProvider(selected);
  const selectedRate = parseExchangeRate(selectedChannel?.exchangeRate);
  const payAmountCny =
    selectedUsesCny && selectedRate
      ? convertUsdToCny(priceUsd, selectedChannel?.exchangeRate)
      : null;

  const payButtonLabel = (() => {
    if (payAmountCny != null) {
      return `${labels.pay} ${formatCnyPrice(payAmountCny)} (≈ ${formatPrice(priceUsd)})`;
    }
    if (selectedUsesCny && !selectedRate) {
      return labels.pay;
    }
    return `${labels.pay} ${formatPrice(priceUsd)}`;
  })();

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
    if (isCnyCheckoutProvider(selected) && !parseExchangeRate(selectedChannel?.exchangeRate)) {
      setError(labels.cnyRateMissing);
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
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">
          {labels.orderInfo}
        </p>
        <h2 className="mt-2 text-lg font-bold text-white">{productName}</h2>
        {payAmountCny != null ? (
          <>
            <p className="mt-2 text-2xl font-black text-[var(--gold)]">
              {formatCnyPrice(payAmountCny)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {labels.usdReference} {formatPrice(priceUsd)} · {labels.cnyRateHint}{" "}
              {selectedRate}
            </p>
          </>
        ) : (
          <p className="mt-2 text-2xl font-black text-[var(--gold)]">
            {formatPrice(priceUsd)}
          </p>
        )}
        {selectedUsesCny && !selectedRate ? (
          <p className="mt-2 text-xs text-amber-400">{labels.cnyRateMissing}</p>
        ) : null}
      </section>

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
                <span className="text-lg">{providerIcon(ch.provider)}</span>
                <span className="flex-1">
                  {ch.label}
                  {channelPayLabel(ch.provider, priceUsd, ch.exchangeRate) ? (
                    <span className="ml-1 text-xs font-normal text-[var(--muted)]">
                      · {channelPayLabel(ch.provider, priceUsd, ch.exchangeRate)}
                    </span>
                  ) : null}
                </span>
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
        {isLoading ? labels.loading : payButtonLabel}
      </PrimaryButton>
    </form>
  );
}
