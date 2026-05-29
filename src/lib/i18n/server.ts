import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { getDictionary, type Dict } from "./dictionaries";

type SiteLanguageSettings = {
  enabled: Locale[];
  default: Locale;
};

export async function getSiteLanguageSettings(): Promise<SiteLanguageSettings> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["enabled_languages", "default_language"]);

    const enabledRaw = data?.find((r) => r.key === "enabled_languages")?.value;
    const defaultRaw = data?.find((r) => r.key === "default_language")?.value;

    const enabled = Array.isArray(enabledRaw)
      ? (enabledRaw.filter((v) => isLocale(String(v))) as Locale[])
      : (["en", "zh"] as Locale[]);

    const def = isLocale(typeof defaultRaw === "string" ? defaultRaw : undefined)
      ? (defaultRaw as Locale)
      : DEFAULT_LOCALE;

    return {
      enabled: enabled.length > 0 ? enabled : ["en"],
      default: enabled.includes(def) ? def : enabled[0] ?? DEFAULT_LOCALE,
    };
  } catch {
    return { enabled: ["en", "zh"], default: DEFAULT_LOCALE };
  }
}

/** Resolve current storefront locale from cookie, clamped to enabled languages. */
export async function getLocale(): Promise<Locale> {
  const settings = await getSiteLanguageSettings();
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;

  if (isLocale(fromCookie) && settings.enabled.includes(fromCookie)) {
    return fromCookie;
  }
  return settings.default;
}

export async function getTranslations(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
