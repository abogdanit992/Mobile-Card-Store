import { adminHref } from "@/lib/admin-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import { updateHomeContentAction } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

export default async function AdminHomepageContentPage() {
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
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

  const map = new Map((rows ?? []).map((r) => [r.key, r.value]));
  const str = (key: string) => {
    const v = map.get(key);
    return typeof v === "string" ? v : "";
  };
  const heroEnabled = map.get("home_hero_enabled") !== false;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.homepageTitle}
        subtitle={t.homepageSubtitle}
      />

      <ActionForm
        action={updateHomeContentAction}
        className="mt-4 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel={t.saveContent}
        pendingLabel={t.saving}
      >
        <p className="text-sm font-semibold text-neutral-900">{t.headerTagline}</p>
        <input
          name="home_tagline_en"
          defaultValue={str("home_tagline_en")}
          placeholder={t.taglineEnPh}
          className={inputClass}
        />
        <input
          name="home_tagline_zh"
          defaultValue={str("home_tagline_zh")}
          placeholder={t.taglineZhPh}
          className={inputClass}
        />

        <div className="mt-2 border-t border-neutral-200 pt-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <input
              type="checkbox"
              name="home_hero_enabled"
              defaultChecked={heroEnabled}
              className="h-4 w-4"
            />
            {t.showVipHero}
          </label>
        </div>

        <p className="mt-2 text-sm font-semibold text-neutral-900">{t.heroEyebrow}</p>
        <input
          name="home_hero_eyebrow_en"
          defaultValue={str("home_hero_eyebrow_en")}
          placeholder={t.heroEyebrowEnPh}
          className={inputClass}
        />
        <input
          name="home_hero_eyebrow_zh"
          defaultValue={str("home_hero_eyebrow_zh")}
          placeholder={t.heroEyebrowZhPh}
          className={inputClass}
        />

        <p className="mt-2 text-sm font-semibold text-neutral-900">{t.heroTitle}</p>
        <input
          name="home_hero_title_en"
          defaultValue={str("home_hero_title_en")}
          placeholder={t.heroTitleEnPh}
          className={inputClass}
        />
        <input
          name="home_hero_title_zh"
          defaultValue={str("home_hero_title_zh")}
          placeholder={t.heroTitleZhPh}
          className={inputClass}
        />

        <p className="mt-2 text-sm font-semibold text-neutral-900">{t.heroDesc}</p>
        <input
          name="home_hero_desc_en"
          defaultValue={str("home_hero_desc_en")}
          placeholder={t.heroDescEnPh}
          className={inputClass}
        />
        <input
          name="home_hero_desc_zh"
          defaultValue={str("home_hero_desc_zh")}
          placeholder={t.heroDescZhPh}
          className={inputClass}
        />
      </ActionForm>
    </main>
  );
}
