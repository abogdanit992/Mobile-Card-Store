import { redirect } from "next/navigation";

// Storefront is guest-only: buying needs no account.
export default function RegisterPage() {
  redirect("/orders/lookup");
}
