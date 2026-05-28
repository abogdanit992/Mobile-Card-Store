import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";

export default async function AdminUsersPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("id,email,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">User Management</h1>

      <section className="mt-4 grid gap-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load users: {error.message}
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
                Joined: {new Date(user.created_at).toLocaleString("en-US")}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            No users found.
          </div>
        )}
      </section>
    </main>
  );
}
