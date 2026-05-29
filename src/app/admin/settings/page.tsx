import Link from "next/link";
import { adminHref } from "@/lib/admin-url";
import { getSiteLanguageSettings } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/admin/action-form";
import { updateLanguageSettingsAction } from "./actions";

export default async function AdminSettingsPage() {
  const backHref = await adminHref("/admin");
  const settings = await getSiteLanguageSettings();

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", ["support_chat_url", "tawk_src", "whatsapp_url"]);
  const valueOf = (key: string) => {
    const v = rows?.find((r) => r.key === key)?.value;
    return typeof v === "string" ? v : "";
  };
  const supportChatUrl = valueOf("support_chat_url");
  const tawkSrc = valueOf("tawk_src");
  const whatsappUrl = valueOf("whatsapp_url");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Site Settings</h1>
      <p className="text-sm text-neutral-500">Storefront languages</p>

      <ActionForm
        action={updateLanguageSettingsAction}
        className="mt-4 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel="Save settings"
        pendingLabel="Saving…"
      >
        <p className="text-sm font-semibold text-neutral-900">Enabled languages</p>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="enable_en"
            defaultChecked={settings.enabled.includes("en")}
            className="h-4 w-4"
          />
          English
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="enable_zh"
            defaultChecked={settings.enabled.includes("zh")}
            className="h-4 w-4"
          />
          中文 (uncheck to hide Chinese on storefront after launch)
        </label>

        <p className="mt-2 text-sm font-semibold text-neutral-900">Default language</p>
        <select
          name="default_language"
          defaultValue={settings.default}
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>

        <p className="mt-2 text-sm font-semibold text-neutral-900">
          Tawk.to live chat (recommended)
        </p>
        <input
          name="tawk_src"
          defaultValue={tawkSrc}
          placeholder="https://embed.tawk.to/<propertyId>/<widgetId>"
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
        />
        <p className="text-xs text-neutral-500">
          Paste the Widget embed URL from Tawk.to → Administration → Channels →
          Chat Widget. When set, a floating chat bubble shows on the storefront
          and the “Support” tab opens it.
        </p>

        <p className="mt-2 text-sm font-semibold text-neutral-900">
          Fallback chat link (optional)
        </p>
        <input
          name="support_chat_url"
          defaultValue={supportChatUrl}
          placeholder="https://t.me/… / https://wa.me/… / QQ link"
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
        />
        <p className="text-xs text-neutral-500">
          Used only when Tawk.to above is empty. Leave both blank to show a
          “coming soon” message.
        </p>

        <p className="mt-2 text-sm font-semibold text-neutral-900">
          WhatsApp button (optional)
        </p>
        <input
          name="whatsapp_url"
          defaultValue={whatsappUrl}
          placeholder="https://wa.me/447700900000?text=Hi"
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
        />
        <p className="text-xs text-neutral-500">
          When set, a green WhatsApp button floats on the storefront (bottom-left,
          next to the chat bubble). Format: https://wa.me/&lt;country code+number,
          no “+” or spaces&gt;. This works alongside Tawk.to.
        </p>
      </ActionForm>
    </main>
  );
}
