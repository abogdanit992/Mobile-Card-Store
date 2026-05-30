import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import {
  createAdAction,
  deleteAdAction,
  toggleAdAction,
  updateAdAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

export default async function AdminAdsPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: ads, error } = await supabase
    .from("ads")
    .select("id,text_en,text_zh,link_url,sort_order,active")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Scrolling Ads</h1>
      <p className="text-sm text-neutral-500">
        Right-to-left marquee shown on the storefront home. Add a link (e.g.
        /support) to make the ad clickable.
      </p>

      <ActionForm
        action={createAdAction}
        resetOnSuccess
        className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel="Add ad"
        pendingLabel="Adding…"
      >
        <h2 className="text-sm font-semibold text-neutral-900">New ad</h2>
        <input
          name="text_en"
          placeholder="Ad text (EN) *"
          className={inputClass}
          required
        />
        <input name="text_zh" placeholder="广告文案 (中文)" className={inputClass} />
        <input
          name="link_url"
          placeholder="Link (optional, e.g. /support)"
          className={inputClass}
        />
        <input name="sort_order" type="number" defaultValue={0} className={inputClass} />
      </ActionForm>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {ads?.map((a) => (
          <div key={a.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <ActionForm
              action={updateAdAction}
              className="space-y-2"
              buttonClassName="h-9 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              submitLabel="Save"
              pendingLabel="Saving…"
            >
              <input type="hidden" name="id" value={a.id} />
              <div className="flex items-center justify-end">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    a.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {a.active ? "ACTIVE" : "HIDDEN"}
                </span>
              </div>
              <input name="text_en" defaultValue={a.text_en} className={inputClass} required />
              <input
                name="text_zh"
                defaultValue={a.text_zh ?? ""}
                placeholder="中文文案"
                className={inputClass}
              />
              <input
                name="link_url"
                defaultValue={a.link_url ?? ""}
                placeholder="Link (optional)"
                className={inputClass}
              />
              <input
                name="sort_order"
                type="number"
                defaultValue={a.sort_order}
                className={inputClass}
              />
            </ActionForm>
            <div className="mt-2 flex gap-2">
              <ActionForm
                action={toggleAdAction}
                className="flex-1"
                buttonClassName={`h-9 w-full rounded-lg border text-xs font-semibold ${
                  a.active
                    ? "border-amber-300 text-amber-700"
                    : "border-emerald-300 text-emerald-700"
                }`}
                submitLabel={a.active ? "Hide from store" : "Show on store"}
                pendingLabel="…"
              >
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="nextActive" value={String(!a.active)} />
              </ActionForm>
              <ActionForm
                action={deleteAdAction}
                className="flex-1"
                buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel="Delete"
                pendingLabel="Deleting…"
                confirm="Delete this ad? This cannot be undone."
              >
                <input type="hidden" name="id" value={a.id} />
              </ActionForm>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
