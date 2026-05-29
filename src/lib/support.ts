import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SupportSettings = {
  /** Tawk.to embed src, e.g. https://embed.tawk.to/<propertyId>/<widgetId> */
  tawkSrc: string;
  /** Optional alternative chat link (Telegram / WhatsApp / QQ / …) */
  supportUrl: string;
  /** Optional WhatsApp link (wa.me/…) shown as a floating button */
  whatsappUrl: string;
};

function strValue(
  rows: { key: string; value: unknown }[] | null | undefined,
  key: string,
): string {
  const v = rows?.find((r) => r.key === key)?.value;
  return typeof v === "string" ? v.trim() : "";
}

/** Only allow the official Tawk.to embed origin. */
export function isValidTawkSrc(src: string): boolean {
  return /^https:\/\/embed\.tawk\.to\/[\w-]+\/[\w-]+$/.test(src);
}

export async function getSupportSettings(): Promise<SupportSettings> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["tawk_src", "support_chat_url", "whatsapp_url"]);

    return {
      tawkSrc: strValue(data, "tawk_src"),
      supportUrl: strValue(data, "support_chat_url"),
      whatsappUrl: strValue(data, "whatsapp_url"),
    };
  } catch {
    return { tawkSrc: "", supportUrl: "", whatsappUrl: "" };
  }
}
