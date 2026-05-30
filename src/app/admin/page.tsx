import Link from "next/link";
import { adminSignOutAction } from "@/app/auth/actions";
import { adminHref } from "@/lib/admin-url";

const adminLinks = [
  { path: "/admin/products", label: "商品管理 Products", desc: "新建 / 编辑 / 删除 / 上下架" },
  { path: "/admin/categories", label: "分类管理 Categories", desc: "主站板块 / 排序 / 图标" },
  { path: "/admin/platforms", label: "平台下载 Downloads", desc: "各直播软件下载地址" },
  { path: "/admin/links", label: "快捷按钮 Quick Links", desc: "主站顶部按钮 / 排序 / 显隐" },
  { path: "/admin/ads", label: "滚动广告 Ads", desc: "首页跑马灯 / 添加编辑删除显隐" },
  { path: "/admin/homepage", label: "首页文案 Homepage", desc: "标语 / VIP 横幅 文案" },
  { path: "/admin/faqs", label: "常见问题 FAQ", desc: "问答内容 / 排序 / 显隐" },
  { path: "/admin/payments", label: "支付通道 Payments", desc: "Cryptomus / Stripe / PayPal" },
  { path: "/admin/orders", label: "订单管理 Orders", desc: "查看支付与发卡状态" },
  { path: "/admin/customers", label: "客户档案 Customers", desc: "销售数据 / 群发导出" },
  { path: "/admin/cards", label: "卡密库存 Cards", desc: "导入与库存统计" },
  { path: "/admin/users", label: "用户管理 Users", desc: "注册用户列表" },
  { path: "/admin/settings", label: "站点设置 Settings", desc: "语言 / 上线开关" },
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
