import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";

export default async function AdminUsersPage() {
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const dateLocale = locale === "zh" ? "zh-CN" : "en-US";

  const { data: users, error } = await supabase
    .from("users")
    .select("id,email,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.usersTitle}
      />

      <section className="mt-4 grid gap-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {t.loadFailed}: {error.message}
          </div>
        ) : users && users.length > 0 ? (
          users.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <p className="break-all text-sm font-medium text-neutral-900">{user.email}</p>
              <p className="mt-1 break-all text-xs text-neutral-500">ID: {user.id}</p>
              <p className="mt-1 text-xs text-neutral-600">
                {t.joined}: {new Date(user.created_at).toLocaleString(dateLocale)}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            {t.noUsers}
          </div>
        )}
      </section>
    </main>
  );
}
