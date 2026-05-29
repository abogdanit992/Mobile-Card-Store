import { setLocaleAction } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
  enabled: Locale[];
};

const LABELS: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};

export function LanguageSwitcher({ locale, enabled }: LanguageSwitcherProps) {
  if (enabled.length < 2) return null;

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] p-0.5">
      {enabled.map((code) => (
        <form key={code} action={setLocaleAction}>
          <input type="hidden" name="locale" value={code} />
          <button
            type="submit"
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
              code === locale
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-white"
            }`}
          >
            {LABELS[code]}
          </button>
        </form>
      ))}
    </div>
  );
}
