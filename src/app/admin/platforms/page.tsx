import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import {
  createPlatformAction,
  deletePlatformAction,
  togglePlatformAction,
  updatePlatformAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

type CategoryOption = { id: string; name_en: string };

function CategorySelect({
  categories,
  value,
}: {
  categories: CategoryOption[];
  value?: string | null;
}) {
  return (
    <select name="category_id" defaultValue={value ?? ""} className={inputClass}>
      <option value="">— No category —</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name_en}
        </option>
      ))}
    </select>
  );
}

export default async function AdminPlatformsPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();

  const [{ data: categories }, { data: platforms, error }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name_en")
      .order("sort_order", { ascending: true }),
    supabase
      .from("platform_downloads")
      .select(
        "id,category_id,name_en,name_zh,logo_url,android_url,ios_url,cloud_url,download_page,sort_order,active",
      )
      .order("sort_order", { ascending: true }),
  ]);

  const cats = categories ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
        Platform Downloads
      </h1>
      <p className="text-sm text-neutral-500">Per-app download links</p>

      <ActionForm
        action={createPlatformAction}
        resetOnSuccess
        className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
        buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        submitLabel="Add platform"
        pendingLabel="Adding…"
      >
        <h2 className="text-sm font-semibold text-neutral-900">New platform</h2>
        <input name="name_en" placeholder="Name (EN) *" className={inputClass} required />
        <input name="name_zh" placeholder="名称 (中文)" className={inputClass} />
        <CategorySelect categories={cats} />
        <input name="logo_url" placeholder="Logo URL" className={inputClass} />
        <input name="android_url" placeholder="Android URL" className={inputClass} />
        <input name="ios_url" placeholder="iOS URL" className={inputClass} />
        <input name="cloud_url" placeholder="Cloud / backup URL" className={inputClass} />
        <input name="download_page" placeholder="Detail page URL" className={inputClass} />
        <input
          name="sort_order"
          type="number"
          defaultValue={0}
          className={inputClass}
        />
      </ActionForm>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {platforms?.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <ActionForm
              action={updatePlatformAction}
              className="space-y-2"
              buttonClassName="h-9 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              submitLabel="Save"
              pendingLabel="Saving…"
            >
              <input type="hidden" name="id" value={p.id} />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900">
                  {p.name_en}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {p.active ? "ACTIVE" : "HIDDEN"}
                </span>
              </div>
              <input name="name_en" defaultValue={p.name_en} className={inputClass} required />
              <input
                name="name_zh"
                defaultValue={p.name_zh ?? ""}
                placeholder="中文名"
                className={inputClass}
              />
              <CategorySelect categories={cats} value={p.category_id} />
              <input
                name="logo_url"
                defaultValue={p.logo_url ?? ""}
                placeholder="Logo URL"
                className={inputClass}
              />
              <input
                name="android_url"
                defaultValue={p.android_url ?? ""}
                placeholder="Android URL"
                className={inputClass}
              />
              <input
                name="ios_url"
                defaultValue={p.ios_url ?? ""}
                placeholder="iOS URL"
                className={inputClass}
              />
              <input
                name="cloud_url"
                defaultValue={p.cloud_url ?? ""}
                placeholder="Cloud / backup URL"
                className={inputClass}
              />
              <input
                name="download_page"
                defaultValue={p.download_page ?? ""}
                placeholder="Detail page URL"
                className={inputClass}
              />
              <input
                name="sort_order"
                type="number"
                defaultValue={p.sort_order}
                className={inputClass}
              />
            </ActionForm>
            <div className="mt-2 flex gap-2">
              <ActionForm
                action={togglePlatformAction}
                className="flex-1"
                buttonClassName="h-9 w-full rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700"
                submitLabel={p.active ? "Hide" : "Show"}
                pendingLabel="…"
              >
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="nextActive" value={String(!p.active)} />
              </ActionForm>
              <ActionForm
                action={deletePlatformAction}
                className="flex-1"
                buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                submitLabel="Delete"
                pendingLabel="Deleting…"
                confirm="Delete this platform? This cannot be undone."
              >
                <input type="hidden" name="id" value={p.id} />
              </ActionForm>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
