import { cookies } from "next/headers";
import {
  ADMIN_LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "./config";
import { getAdminDictionary, type AdminDict } from "./admin-dictionaries";

/** Admin UI defaults to Chinese; falls back to en if cookie invalid. */
export async function getAdminLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ADMIN_LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  return "zh";
}

export async function getAdminTranslations(): Promise<{
  locale: Locale;
  t: AdminDict;
}> {
  const locale = await getAdminLocale();
  return { locale, t: getAdminDictionary(locale) };
}
