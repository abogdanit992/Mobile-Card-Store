import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import { signUpAction } from "@/app/auth/actions";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error, success } = await searchParams;

  return (
    <MobileShell showNav={false}>
      <StoreHeader title="邮箱注册" subtitle="验证邮件将发送到您的邮箱" backHref="/account" />
      <div className="px-4 pt-4">
        {success === "check_email" ? (
          <section className="mb-4 rounded-xl border border-emerald-900/40 bg-emerald-950/30 p-4 text-sm text-emerald-300">
            注册邮件已发送，请点击邮件中的链接完成验证后再登录。
          </section>
        ) : null}

        <form action={signUpAction} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div>
            <label className="text-xs text-[var(--muted)]">邮箱（用于注册验证）</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">手机号（仅作联系，不作验证）</label>
            <input
              name="phone"
              type="tel"
              placeholder="+86 13800000000"
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">密码（至少 6 位）</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 text-sm text-white"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-400">注册失败，请更换邮箱或稍后重试。</p>
          ) : null}
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-gradient-to-r from-[var(--accent)] to-fuchsia-600 text-sm font-bold text-white"
          >
            注册并发送验证邮件
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          已有账号？{" "}
          <Link href="/login" className="font-bold text-[var(--accent-soft)]">
            去登录
          </Link>
        </p>
      </div>
    </MobileShell>
  );
}
