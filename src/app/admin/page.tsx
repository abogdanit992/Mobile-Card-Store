import Link from "next/link";

const adminLinks = [
  { href: "/admin/products", label: "Products", desc: "Create and manage products" },
  { href: "/admin/orders", label: "Orders", desc: "Track payment and delivery status" },
  { href: "/admin/cards", label: "Cards", desc: "Manage card-code inventory" },
  { href: "/admin/users", label: "Users", desc: "Review user profiles and activity" },
];

export default function AdminHomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Admin</h1>
      <p className="mt-1 text-sm text-neutral-600">Back-office management panel</p>

      <section className="mt-4 grid gap-3">
        {adminLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <h2 className="text-base font-medium text-neutral-900">{item.label}</h2>
            <p className="mt-1 text-sm text-neutral-600">{item.desc}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
