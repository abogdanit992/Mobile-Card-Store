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
  const { data: supportRow } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "support_chat_url")
    .maybeSingle();
  const supportChatUrl =
    typeof supportRow?.value === "string" ? supportRow.value : "";

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
          Online support link
        </p>
        <input
          name="support_chat_url"
          defaultValue={supportChatUrl}
          placeholder="https://tawk.to/… / https://t.me/… / https://wa.me/…"
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
        />
        <p className="text-xs text-neutral-500">
          The storefront “Support” tab opens this link. Leave blank to show a
          “coming soon” message. Works with any free chat (Tawk.to, Telegram,
          WhatsApp, QQ…).
        </p>
      </ActionForm>
    </main>
  );
}
