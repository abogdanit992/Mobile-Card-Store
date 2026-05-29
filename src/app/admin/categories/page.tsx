import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  createCategoryAction,
  deleteCategoryAction,
  toggleCategoryAction,
  updateCategoryAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

export default async function AdminCategoriesPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id,slug,name_en,name_zh,icon_url,sort_order,active")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Categories</h1>
      <p className="text-sm text-neutral-500">Storefront sections / box brands</p>

      <form
        action={createCategoryAction}
        className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <h2 className="text-sm font-semibold text-neutral-900">New category</h2>
        <input name="name_en" placeholder="Name (EN) *" className={inputClass} required />
        <input name="name_zh" placeholder="名称 (中文)" className={inputClass} />
        <input name="slug" placeholder="slug (optional)" className={inputClass} />
        <input name="icon_url" placeholder="Icon URL" className={inputClass} />
        <input
          name="sort_order"
          type="number"
          defaultValue={0}
          placeholder="Sort order"
          className={inputClass}
        />
        <SubmitButton
          pendingText="Adding…"
          className="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
        >
          Add category
        </SubmitButton>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {categories?.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <form action={updateCategoryAction} className="space-y-2">
              <input type="hidden" name="id" value={c.id} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">{c.slug}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    c.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {c.active ? "ACTIVE" : "HIDDEN"}
                </span>
              </div>
              <input
                name="name_en"
                defaultValue={c.name_en}
                className={inputClass}
                required
              />
              <input
                name="name_zh"
                defaultValue={c.name_zh ?? ""}
                placeholder="中文名"
                className={inputClass}
              />
              <input
                name="icon_url"
                defaultValue={c.icon_url ?? ""}
                placeholder="Icon URL"
                className={inputClass}
              />
              <input
                name="sort_order"
                type="number"
                defaultValue={c.sort_order}
                className={inputClass}
              />
              <SubmitButton
                pendingText="Saving…"
                className="h-9 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              >
                Save
              </SubmitButton>
            </form>
            <div className="mt-2 flex gap-2">
              <form action={toggleCategoryAction} className="flex-1">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="nextActive" value={String(!c.active)} />
                <SubmitButton
                  pendingText="…"
                  className="h-9 w-full rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700"
                >
                  {c.active ? "Hide" : "Show"}
                </SubmitButton>
              </form>
              <form action={deleteCategoryAction} className="flex-1">
                <input type="hidden" name="id" value={c.id} />
                <SubmitButton
                  pendingText="Deleting…"
                  className="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                >
                  Delete
                </SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
