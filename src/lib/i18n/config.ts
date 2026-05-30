export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";
/** Admin panel UI language (independent from storefront locale). */
export const ADMIN_LOCALE_COOKIE = "admin_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "zh";
}

/** Pick localized field with fallback (en -> zh -> default). */
export function pickLocalized(
  locale: Locale,
  en: string | null | undefined,
  zh: string | null | undefined,
  fallback = "",
): string {
  if (locale === "zh") return zh || en || fallback;
  return en || zh || fallback;
}
