import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { signInAction } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;

  return (
    <MobileShell showNav={false}>
      <StoreHeader title="邮箱登录" subtitle="使用注册邮箱验证登录" backHref="/account" />
      <div className="px-4 pt-4">
        <form action={signInAction} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <input type="hidden" name="next" value={next ?? "/account"} />
          <div>
            <label className="text-xs text-[var(--muted)]">邮箱</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">密码</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-400">登录失败，请检查邮箱与密码。</p>
          ) : null}
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-gradient-to-r from-[var(--accent)] to-fuchsia-600 text-sm font-bold text-white"
          >
            登录
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          没有账号？{" "}
          <Link href="/register" className="font-bold text-[var(--accent-soft)]">
            邮箱注册
          </Link>
        </p>
      </div>
    </MobileShell>
  );
}
