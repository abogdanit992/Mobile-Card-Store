import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import {
  createQuickLinkAction,
  deleteQuickLinkAction,
  toggleQuickLinkAction,
  updateQuickLinkAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

export default async function AdminLinksPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: links, error } = await supabase
    .from("quick_links")
    .select("id,label_en,label_zh,url,is_external,sort_order,active")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Quick Links</h1>
      <p className="text-sm text-neutral-500">
        Top buttons on the storefront home (e.g. Downloads, FAQ, Track Order)
      </p>

      <ActionForm
        action={createQuickLinkAction}
        resetOnSuccess
        className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel="Add link"
        pendingLabel="Adding…"
      >
        <h2 className="text-sm font-semibold text-neutral-900">New link</h2>
        <input name="label_en" placeholder="Label (EN) *" className={inputClass} required />
        <input name="label_zh" placeholder="标签 (中文)" className={inputClass} />
        <input
          name="url"
          placeholder="URL or path (e.g. /faq or https://…) *"
          className={inputClass}
          required
        />
        <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
          <input type="checkbox" name="is_external" className="h-4 w-4" />
          External link (open in new tab)
        </label>
        <input name="sort_order" type="number" defaultValue={0} className={inputClass} />
      </ActionForm>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {links?.map((l) => (
          <div key={l.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <ActionForm
              action={updateQuickLinkAction}
              className="space-y-2"
              buttonClassName="h-9 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              submitLabel="Save"
              pendingLabel="Saving…"
            >
              <input type="hidden" name="id" value={l.id} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {l.is_external ? "external" : "internal"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    l.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {l.active ? "ACTIVE" : "HIDDEN"}
                </span>
              </div>
              <input name="label_en" defaultValue={l.label_en} className={inputClass} required />
              <input
                name="label_zh"
                defaultValue={l.label_zh ?? ""}
                placeholder="中文标签"
                className={inputClass}
              />
              <input name="url" defaultValue={l.url} className={inputClass} required />
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  name="is_external"
                  defaultChecked={l.is_external}
                  className="h-4 w-4"
                />
                External link (open in new tab)
              </label>
              <input
                name="sort_order"
                type="number"
                defaultValue={l.sort_order}
                className={inputClass}
              />
            </ActionForm>
            <div className="mt-2 flex gap-2">
              <ActionForm
                action={toggleQuickLinkAction}
                className="flex-1"
                buttonClassName={`h-9 w-full rounded-lg border text-xs font-semibold ${
                  l.active
                    ? "border-amber-300 text-amber-700"
                    : "border-emerald-300 text-emerald-700"
                }`}
                submitLabel={l.active ? "Hide from store" : "Show on store"}
                pendingLabel="…"
              >
                <input type="hidden" name="id" value={l.id} />
                <input type="hidden" name="nextActive" value={String(!l.active)} />
              </ActionForm>
              <ActionForm
                action={deleteQuickLinkAction}
                className="flex-1"
                buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel="Delete"
                pendingLabel="Deleting…"
                confirm="Delete this link? This cannot be undone."
              >
                <input type="hidden" name="id" value={l.id} />
              </ActionForm>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
