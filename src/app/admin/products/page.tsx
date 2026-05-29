import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import {
  createProductAction,
  deleteProductAction,
  toggleProductStatusAction,
  updateProductAction,
} from "./actions";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

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

export default async function AdminProductsPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();

  const [{ data: categories }, { data: products, error }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name_en")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        "id,title,name_en,name_zh,description_en,description_zh,price,cover,category_id,active,created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const cats = categories ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <header className="mb-4">
        <Link href={backHref} className="text-sm text-neutral-500">
          ← Back to admin
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
          Product Management
        </h1>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">Create product</h2>
        <ActionForm
          action={createProductAction}
          resetOnSuccess
          className="mt-3 grid gap-2"
          buttonClassName="mt-1 h-10 rounded-lg bg-neutral-900 text-sm font-medium text-white"
          submitLabel="Create Product"
          pendingLabel="Creating…"
        >
          <input name="name_en" required placeholder="Name (EN) *" className={inputClass} />
          <input name="name_zh" placeholder="名称 (中文)" className={inputClass} />
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            required
            placeholder="Price (USD)"
            className={inputClass}
          />
          <CategorySelect categories={cats} />
          <input name="cover" placeholder="Cover URL (optional)" className={inputClass} />
          <textarea
            name="description_en"
            rows={2}
            placeholder="Description (EN)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <textarea
            name="description_zh"
            rows={2}
            placeholder="描述 (中文)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </ActionForm>
      </section>

      <section className="mt-4 grid gap-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load products: {error.message}
          </div>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600">{formatPrice(product.price)}</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    product.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {product.active ? "Active" : "Inactive"}
                </span>
              </div>

              <ActionForm
                action={updateProductAction}
                className="mt-2 grid gap-2"
                buttonClassName="h-9 rounded-lg bg-neutral-900 text-sm font-semibold text-white"
                submitLabel="Save"
                pendingLabel="Saving…"
              >
                <input type="hidden" name="id" value={product.id} />
                <input
                  name="name_en"
                  required
                  defaultValue={product.name_en ?? product.title}
                  className={inputClass}
                />
                <input
                  name="name_zh"
                  defaultValue={product.name_zh ?? ""}
                  placeholder="中文名"
                  className={inputClass}
                />
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue={product.price}
                  className={inputClass}
                />
                <CategorySelect categories={cats} value={product.category_id} />
                <input
                  name="cover"
                  defaultValue={product.cover ?? ""}
                  placeholder="Cover URL"
                  className={inputClass}
                />
                <textarea
                  name="description_en"
                  rows={2}
                  defaultValue={product.description_en ?? ""}
                  placeholder="Description (EN)"
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
                <textarea
                  name="description_zh"
                  rows={2}
                  defaultValue={product.description_zh ?? ""}
                  placeholder="描述 (中文)"
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </ActionForm>

              <div className="mt-2 flex gap-2">
                <ActionForm
                  action={toggleProductStatusAction}
                  className="flex-1"
                  buttonClassName="h-9 w-full rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-800"
                  submitLabel={product.active ? "Set Inactive" : "Set Active"}
                  pendingLabel="…"
                >
                  <input type="hidden" name="id" value={product.id} />
                  <input
                    type="hidden"
                    name="nextActive"
                    value={product.active ? "false" : "true"}
                  />
                </ActionForm>
                <ActionForm
                  action={deleteProductAction}
                  className="flex-1"
                  buttonClassName="h-9 w-full rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                  submitLabel="Delete"
                  pendingLabel="Deleting…"
                  confirm="Delete this product? This cannot be undone."
                >
                  <input type="hidden" name="id" value={product.id} />
                </ActionForm>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            No products yet.
          </div>
        )}
      </section>
    </main>
  );
}
