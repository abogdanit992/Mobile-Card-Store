import Link from "next/link";
import { adminSignOutAction } from "@/app/auth/actions";
import { adminHref } from "@/lib/admin-url";
import { AdminLangSwitcher } from "@/components/admin/admin-lang-switcher";
import { getAdminTranslations } from "@/lib/i18n/admin-server";

export default async function AdminHomePage() {
  const { locale, t } = await getAdminTranslations();

  const adminLinks = [
    { path: "/admin/products", label: t.navProducts, desc: t.navProductsDesc },
    { path: "/admin/categories", label: t.navCategories, desc: t.navCategoriesDesc },
    { path: "/admin/platforms", label: t.navPlatforms, desc: t.navPlatformsDesc },
    { path: "/admin/links", label: t.navLinks, desc: t.navLinksDesc },
    { path: "/admin/ads", label: t.navAds, desc: t.navAdsDesc },
    { path: "/admin/homepage", label: t.navHomepage, desc: t.navHomepageDesc },
    { path: "/admin/faqs", label: t.navFaqs, desc: t.navFaqsDesc },
    { path: "/admin/payments", label: t.navPayments, desc: t.navPaymentsDesc },
    { path: "/admin/orders", label: t.navOrders, desc: t.navOrdersDesc },
    { path: "/admin/customers", label: t.navCustomers, desc: t.navCustomersDesc },
    { path: "/admin/cards", label: t.navCards, desc: t.navCardsDesc },
    { path: "/admin/users", label: t.navUsers, desc: t.navUsersDesc },
    { path: "/admin/settings", label: t.navSettings, desc: t.navSettingsDesc },
  ];

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
          <h1 className="text-2xl font-semibold text-white">{t.adminTitle}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t.adminSubtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <AdminLangSwitcher locale={locale} />
          <form action={adminSignOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)]"
            >
              {t.signOut}
            </button>
          </form>
        </div>
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
