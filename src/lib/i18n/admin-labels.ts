import { pickLocalized, type Locale } from "@/lib/i18n/config";

/** Category / platform name for admin dropdowns (respects admin UI locale). */
export function adminCategoryLabel(
  locale: Locale,
  nameEn: string,
  nameZh: string | null | undefined,
): string {
  return pickLocalized(locale, nameEn, nameZh);
}

/** Product display name for admin lists. */
export function adminProductLabel(
  locale: Locale,
  nameEn: string | null | undefined,
  nameZh: string | null | undefined,
  title: string,
): string {
  return pickLocalized(locale, nameEn ?? title, nameZh, title);
}
