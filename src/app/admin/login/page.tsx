import { adminSignInAction } from "@/app/auth/actions";
import { AdminLangSwitcher } from "@/components/admin/admin-lang-switcher";
import { getAdminTranslations } from "@/lib/i18n/admin-server";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error, next } = await searchParams;
  const { locale, t } = await getAdminTranslations();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-[#0c0612] px-4">
      <div className="mb-4 flex justify-end">
        <AdminLangSwitcher locale={locale} />
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-soft)]">
          {t.loginEyebrow}
        </p>
        <h1 className="mt-1 text-xl font-bold text-white">{t.loginTitle}</h1>
        <p className="mt-2 text-xs text-[var(--muted)]">{t.loginDesc}</p>

        <form action={adminSignInAction} className="mt-5 space-y-3">
          <input type="hidden" name="next" value={next ?? "/"} />
          <input
            name="email"
            type="email"
            required
            placeholder={t.loginEmail}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder={t.loginPassword}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
          />
          {error === "not_admin" ? (
            <p className="text-sm text-red-400">{t.loginNotAdmin}</p>
          ) : error ? (
            <p className="text-sm text-red-400">{t.loginFailed}</p>
          ) : null}
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-bold text-white"
          >
            {t.loginSubmit}
          </button>
        </form>
      </div>
    </main>
  );
}
