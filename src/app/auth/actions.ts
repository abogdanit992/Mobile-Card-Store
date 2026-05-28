"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminHost, normalizeHostname } from "@/lib/host";
import { adminLoginPathForHost } from "@/lib/admin-url";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function getHostname() {
  const h = await headers();
  return normalizeHostname(h.get("x-forwarded-host") ?? h.get("host"));
}

function adminLoginPath(hostname: string, query = "") {
  const base = adminLoginPathForHost(hostname);
  return query ? `${base}?${query}` : base;
}

function adminHomePath(hostname: string) {
  return isAdminHost(hostname) ? "/" : "/admin";
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();

  if (!email || !password || password.length < 6) {
    redirect("/register?error=invalid");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      data: phone ? { phone } : undefined,
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/register?success=check_email");
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");

  if (!email || !password) {
    redirect("/login?error=invalid");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account");
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/account");
  redirect("/");
}

export async function adminSignInAction(formData: FormData) {
  const hostname = await getHostname();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? adminHomePath(hostname));

  if (!email || !password) {
    redirect(adminLoginPath(hostname, "error=invalid"));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      adminLoginPath(hostname, `error=${encodeURIComponent(error.message)}`),
    );
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    redirect(adminLoginPath(hostname, "error=not_admin"));
  }

  redirect(next);
}

export async function adminSignOutAction() {
  const hostname = await getHostname();
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(adminLoginPath(hostname));
}
