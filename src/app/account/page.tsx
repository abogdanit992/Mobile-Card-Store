import { redirect } from "next/navigation";

// Storefront is guest-only: no account/registration. Order history is
// available via /orders/lookup (by email or phone).
export default function AccountPage() {
  redirect("/orders/lookup");
}
