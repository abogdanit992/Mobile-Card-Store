import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";
import {
  isAdminHost,
  isAdminPassthroughPath,
  normalizeHostname,
  toAdminInternalPath,
} from "@/lib/host";
import {
  adminLoginPathForHost,
  redirectMainAdminToSubdomain,
} from "@/lib/admin-url";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export async function proxy(request: NextRequest) {
  const hostname = normalizeHostname(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
  const { pathname, search } = request.nextUrl;
  const onAdminHost = isAdminHost(hostname);

  // Main domain /admin/* -> bounce to the admin subdomain.
  if (!onAdminHost && pathname.startsWith("/admin")) {
    const dest = redirectMainAdminToSubdomain(pathname, search);
    return NextResponse.redirect(dest, 307);
  }

  // Build a single Supabase client and refresh the session exactly once.
  let response = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        request.cookies.set(name, value);
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        request.cookies.set(name, "");
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Storefront traffic only needs the refreshed session.
  if (!onAdminHost) {
    return response;
  }

  // Admin subdomain: let API/auth/asset paths pass straight through.
  if (isAdminPassthroughPath(pathname)) {
    return response;
  }

  let internalPath = pathname.startsWith("/admin")
    ? pathname
    : toAdminInternalPath(pathname);

  if (pathname === "/") {
    if (!user?.email) {
      internalPath = "/admin/login";
    } else {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("email")
        .eq("email", user.email)
        .maybeSingle();
      internalPath = adminRow ? "/admin" : "/admin/login";
    }
  }

  let out = response;
  if (internalPath !== pathname) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    out = NextResponse.rewrite(rewriteUrl);
    copyCookies(response, out);
  }

  // The login page never needs the admin gate.
  if (
    !internalPath.startsWith("/admin") ||
    internalPath.startsWith("/admin/login")
  ) {
    return out;
  }

  // Only enforce the admin redirect-gate on real page navigations.
  // Server actions, RSC refreshes and prefetches are protected by database
  // RLS; re-running the gate (and its extra round-trips) on those requests is
  // what made the panel sluggish and caused saved/deleted changes to look like
  // "nothing happened".
  const isDocumentNav =
    request.headers.get("sec-fetch-dest") === "document";
  if (!isDocumentNav) {
    return out;
  }

  const loginPath = adminLoginPathForHost(hostname);

  if (!user?.email) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = loginPath;
    loginUrl.searchParams.set("next", internalPath);
    const redirect = NextResponse.redirect(loginUrl);
    copyCookies(out, redirect);
    return redirect;
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (!adminRow) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = loginPath;
    loginUrl.searchParams.set("error", "not_admin");
    const redirect = NextResponse.redirect(loginUrl);
    copyCookies(out, redirect);
    return redirect;
  }

  return out;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
