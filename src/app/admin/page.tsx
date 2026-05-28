import Link from "next/link";
import { adminSignOutAction } from "@/app/auth/actions";
import { adminHref } from "@/lib/admin-url";

const adminLinks = [
  { path: "/admin/products", label: "商品管理", desc: "上架、下架与新建" },
  { path: "/admin/orders", label: "订单管理", desc: "查看支付与发卡状态" },
  { path: "/admin/cards", label: "卡密库存", desc: "导入与库存统计" },
  { path: "/admin/users", label: "用户管理", desc: "注册用户列表" },
];

export default async function AdminHomePage() {
  const links = await Promise.all(
    adminLinks.map(async (item) => ({
      ...item,
      href: await adminHref(item.path),
    })),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#0c0612] px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">后台管理</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            admin.vkeyshop.co 独立入口
          </p>
        </div>
        <form action={adminSignOutAction}>
          <button
            type="submit"
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)]"
          >
            退出
          </button>
        </form>
      </div>

      <section className="mt-4 grid gap-3">
        {links.map((item) => (
          <Link
            key={item.path}
            href={item.href}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <h2 className="text-base font-medium text-white">{item.label}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.desc}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
