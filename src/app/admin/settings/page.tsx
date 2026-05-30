import { adminHref } from "@/lib/admin-url";
import { getSiteLanguageSettings } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import { updateLanguageSettingsAction } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

export default async function AdminSettingsPage() {
  const { locale, t } = await getAdminTranslations();
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
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.settingsTitle}
        subtitle={t.settingsSubtitle}
      />

      <ActionForm
        action={updateLanguageSettingsAction}
        className="mt-4 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel={t.saveSettings}
        pendingLabel={t.saving}
      >
        <p className="text-sm font-semibold text-neutral-900">{t.enabledLanguages}</p>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="enable_en"
            defaultChecked={settings.enabled.includes("en")}
            className="h-4 w-4"
          />
          {t.enableEnglish}
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="enable_zh"
            defaultChecked={settings.enabled.includes("zh")}
            className="h-4 w-4"
          />
          {t.enableChinese}
        </label>

        <p className="mt-2 text-sm font-semibold text-neutral-900">{t.defaultLanguage}</p>
        <select
          name="default_language"
          defaultValue={settings.default}
          className={inputClass}
        >
          <option value="en">{t.enableEnglish}</option>
          <option value="zh">{t.langZh}</option>
        </select>

        <p className="mt-2 text-sm font-semibold text-neutral-900">{t.tawkTitle}</p>
        <input
          name="tawk_src"
          defaultValue={tawkSrc}
          placeholder={t.tawkPh}
          className={inputClass}
        />
        <p className="text-xs text-neutral-500">{t.tawkHint}</p>

        <p className="mt-2 text-sm font-semibold text-neutral-900">{t.fallbackChat}</p>
        <input
          name="support_chat_url"
          defaultValue={supportChatUrl}
          placeholder={t.fallbackChatPh}
          className={inputClass}
        />
        <p className="text-xs text-neutral-500">{t.fallbackChatHint}</p>

        <p className="mt-2 text-sm font-semibold text-neutral-900">{t.whatsappTitle}</p>
        <input
          name="whatsapp_url"
          defaultValue={whatsappUrl}
          placeholder={t.whatsappPh}
          className={inputClass}
        />
        <p className="text-xs text-neutral-500">{t.whatsappHint}</p>
      </ActionForm>
    </main>
  );
}
