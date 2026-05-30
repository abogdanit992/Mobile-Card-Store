import Link from "next/link";
import { adminHref } from "@/lib/admin-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/admin/action-form";
import { updateHomeContentAction } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

export default async function AdminHomepageContentPage() {
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
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Homepage Content</h1>
      <p className="text-sm text-neutral-500">
        Header tagline and the VIP hero banner on the storefront home. Leave a
        field blank to use the built-in default.
      </p>

      <ActionForm
        action={updateHomeContentAction}
        className="mt-4 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel="Save content"
        pendingLabel="Saving…"
      >
        <p className="text-sm font-semibold text-neutral-900">Header tagline</p>
        <input
          name="home_tagline_en"
          defaultValue={str("home_tagline_en")}
          placeholder="Tagline (EN) — e.g. Private activation · Instant delivery"
          className={inputClass}
        />
        <input
          name="home_tagline_zh"
          defaultValue={str("home_tagline_zh")}
          placeholder="标语 (中文)"
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
            Show VIP hero banner
          </label>
        </div>

        <p className="mt-2 text-sm font-semibold text-neutral-900">Hero — eyebrow (small label)</p>
        <input
          name="home_hero_eyebrow_en"
          defaultValue={str("home_hero_eyebrow_en")}
          placeholder="EN — e.g. Members Only"
          className={inputClass}
        />
        <input
          name="home_hero_eyebrow_zh"
          defaultValue={str("home_hero_eyebrow_zh")}
          placeholder="中文 — 例：会员专区"
          className={inputClass}
        />

        <p className="mt-2 text-sm font-semibold text-neutral-900">Hero — title</p>
        <input
          name="home_hero_title_en"
          defaultValue={str("home_hero_title_en")}
          placeholder="EN — e.g. Limited VIP Card Zone"
          className={inputClass}
        />
        <input
          name="home_hero_title_zh"
          defaultValue={str("home_hero_title_zh")}
          placeholder="中文 — 例：限时 VIP 卡密专区"
          className={inputClass}
        />

        <p className="mt-2 text-sm font-semibold text-neutral-900">Hero — description</p>
        <input
          name="home_hero_desc_en"
          defaultValue={str("home_hero_desc_en")}
          placeholder="EN — e.g. Pay & receive instantly · 24h delivery"
          className={inputClass}
        />
        <input
          name="home_hero_desc_zh"
          defaultValue={str("home_hero_desc_zh")}
          placeholder="中文 — 例：付款即发卡 · 24h 自动交付"
          className={inputClass}
        />
      </ActionForm>
    </main>
  );
}
