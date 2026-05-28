import { adminSignInAction } from "@/app/auth/actions";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error, next } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-[#0c0612] px-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-soft)]">
          Staff Only
        </p>
        <h1 className="mt-1 text-xl font-bold text-white">后台登录</h1>
        <p className="mt-2 text-xs text-[var(--muted)]">
          此入口不在主站展示，仅管理员使用。需使用已授权邮箱登录。
        </p>

        <form action={adminSignInAction} className="mt-5 space-y-3">
          <input type="hidden" name="next" value={next ?? "/"} />
          <input
            name="email"
            type="email"
            required
            placeholder="管理员邮箱"
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="密码"
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
          />
          {error === "not_admin" ? (
            <p className="text-sm text-red-400">该邮箱无后台权限。</p>
          ) : error ? (
            <p className="text-sm text-red-400">登录失败，请检查账号密码。</p>
          ) : null}
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-bold text-white"
          >
            进入后台
          </button>
        </form>
      </div>
    </main>
  );
}
