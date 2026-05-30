import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pickLocalized, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export type HomeContent = {
  tagline: string;
  heroEnabled: boolean;
  heroEyebrow: string;
  heroTitle: string;
  heroDesc: string;
};

/**
 * Backend-editable homepage copy (header tagline + VIP hero banner).
 * Falls back to the i18n dictionary when a value hasn't been set.
 */
export async function getHomeContent(locale: Locale): Promise<HomeContent> {
  const t = getDictionary(locale);
  const fallback: HomeContent = {
    tagline: t.instantDelivery,
    heroEnabled: true,
    heroEyebrow: t.membersOnly,
    heroTitle: t.vipZone,
    heroDesc: t.vipZoneDesc,
  };

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", [
        "home_tagline_en",
        "home_tagline_zh",
        "home_hero_enabled",
        "home_hero_eyebrow_en",
        "home_hero_eyebrow_zh",
        "home_hero_title_en",
        "home_hero_title_zh",
        "home_hero_desc_en",
        "home_hero_desc_zh",
      ]);

    const map = new Map((data ?? []).map((r) => [r.key, r.value]));
    const str = (key: string) => {
      const v = map.get(key);
      return typeof v === "string" ? v.trim() : "";
    };
    const localized = (en: string, zh: string, fb: string) => {
      const picked = pickLocalized(locale, en, zh || null);
      return picked || fb;
    };

    const enabledRaw = map.get("home_hero_enabled");
    const heroEnabled = enabledRaw === false ? false : true;

    return {
      tagline: localized(str("home_tagline_en"), str("home_tagline_zh"), fallback.tagline),
      heroEnabled,
      heroEyebrow: localized(
        str("home_hero_eyebrow_en"),
        str("home_hero_eyebrow_zh"),
        fallback.heroEyebrow,
      ),
      heroTitle: localized(
        str("home_hero_title_en"),
        str("home_hero_title_zh"),
        fallback.heroTitle,
      ),
      heroDesc: localized(
        str("home_hero_desc_en"),
        str("home_hero_desc_zh"),
        fallback.heroDesc,
      ),
    };
  } catch {
    return fallback;
  }
}
