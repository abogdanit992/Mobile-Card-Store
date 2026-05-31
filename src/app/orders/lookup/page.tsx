import Link from "next/link";
import { headers } from "next/headers";
import { formatPrice } from "@/lib/format";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { getTranslations } from "@/lib/i18n/server";
import { lookupOrdersByContact } from "@/lib/orders/server-access";
import {
  checkRateLimit,
  clientIpFromHeaders,
} from "@/lib/security/rate-limit";

type LookupPageProps = {
  searchParams: Promise<{
    email?: string;
    phone?: string;
  }>;
};

export default async function OrderLookupPage({ searchParams }: LookupPageProps) {
  const { email, phone } = await searchParams;
  const { locale, t } = await getTranslations();
  const normalizedEmail = email?.trim().toLowerCase() || null;
  const normalizedPhone = phone?.trim() || null;
  const hasQuery = Boolean(normalizedEmail || normalizedPhone);

  let orders: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    contact_phone: string | null;
  }> = [];
  let errorMessage: string | null = null;

  if (hasQuery) {
    const h = await headers();
    const ip = clientIpFromHeaders(h);
    const allowed = await checkRateLimit({
      bucket: `lookup:${ip}`,
      max: 15,
      windowMs: 60_000,
    });

    if (!allowed) {
      errorMessage = t.rateLimitExceeded;
    } else {
      const { data, error } = await lookupOrdersByContact(
        normalizedEmail,
        normalizedPhone,
      );
      if (error) {
        errorMessage = error.message;
      } else {
        orders = data;
      }
    }
  }

  return (
    <MobileShell>
      <StoreHeader title={t.lookupTitle} subtitle={t.lookupSubtitle} backHref="/" />

      <div className="px-3 pt-3">
        <form className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs text-[var(--muted)]">{t.lookupNeedOne}</p>
          <div>
            <label className="text-xs text-[var(--muted)]">{t.email}</label>
            <input
              name="email"
              type="email"
              inputMode="email"
              defaultValue={normalizedEmail ?? ""}
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">{t.phone}</label>
            <input
              name="phone"
              type="tel"
              defaultValue={normalizedPhone ?? ""}
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-bold text-white"
          >
            {t.lookupQuery}
          </button>
        </form>

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
        ) : null}

        {hasQuery && !errorMessage ? (
          <section className="mt-4 grid gap-2">
            {orders.length > 0 ? (
              orders.map((order) => {
                const contact =
                  order.contact_phone || normalizedEmail || normalizedPhone || "";
                const qs = new URLSearchParams({ orderId: order.id });
                if (normalizedEmail) qs.set("email", normalizedEmail);
                if (normalizedPhone) qs.set("phone", normalizedPhone);
                else if (contact && normalizedEmail) qs.set("email", normalizedEmail);

                return (
                  <Link
                    key={order.id}
                    href={`/cards?${qs.toString()}`}
                    className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent-soft)]"
                  >
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(order.created_at).toLocaleString(
                        locale === "zh" ? "zh-CN" : "en-US",
                      )}
                    </p>
                    <p className="mt-1 font-bold text-[var(--gold)]">
                      {formatPrice(order.amount)} · {order.status}
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      {t.order} {order.id.slice(0, 8)}…
                      {order.contact_phone ? ` · ${order.contact_phone}` : ""}
                    </p>
                    <p className="mt-2 text-xs text-[var(--accent-soft)]">{t.viewCard}</p>
                  </Link>
                );
              })
            ) : (
              <p className="text-center text-sm text-[var(--muted)]">{t.lookupNotFound}</p>
            )}
          </section>
        ) : null}
      </div>
    </MobileShell>
  );
}
