import { redirect } from "next/navigation";

// Storefront is guest-only. Staff sign-in lives at /admin/login.
export default function LoginPage() {
  redirect("/orders/lookup");
}
