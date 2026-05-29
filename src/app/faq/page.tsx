import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { pickLocalized } from "@/lib/i18n/config";

export default async function FaqPage() {
  const { locale, t } = await getTranslations();
  const supabase = await createSupabaseServerClient();

  const { data: faqs } = await supabase
    .from("faqs")
    .select("id,question_en,question_zh,answer_en,answer_zh")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const items = faqs ?? [];

  return (
    <MobileShell>
      <StoreHeader
        title={t.faqTitle}
        subtitle={t.faqSubtitle}
        backHref="/"
        backLabel={t.backHome}
      />

      <div className="space-y-3 px-3 pt-3">
        {items.length === 0 ? (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted)]">
            {t.faqEmpty}
          </p>
        ) : (
          items.map((f) => {
            const q = pickLocalized(locale, f.question_en, f.question_zh);
            const a = pickLocalized(locale, f.answer_en, f.answer_zh);
            return (
              <details
                key={f.id}
                className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-white">
                  <span>{q}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition group-open:rotate-45">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      aria-hidden
                    >
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-[var(--muted)]">
                  {a}
                </p>
              </details>
            );
          })
        )}
      </div>
    </MobileShell>
  );
}
