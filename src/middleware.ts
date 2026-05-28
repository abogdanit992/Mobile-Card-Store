import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";
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

async function resolveAdminRootInternal(
  request: NextRequest,
): Promise<"/admin" | "/admin/login"> {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return "/admin/login";
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return adminRow ? "/admin" : "/admin/login";
}

async function guardAdminRoute(
  request: NextRequest,
  internalPath: string,
  sessionResponse: NextResponse,
  hostname: string,
): Promise<NextResponse> {
  if (
    !internalPath.startsWith("/admin") ||
    internalPath.startsWith("/admin/login")
  ) {
    return sessionResponse;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loginPath = adminLoginPathForHost(hostname);

  if (!user?.email) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = loginPath;
    loginUrl.searchParams.set("next", internalPath);
    const redirect = NextResponse.redirect(loginUrl);
    copyCookies(sessionResponse, redirect);
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
    copyCookies(sessionResponse, redirect);
    return redirect;
  }

  return sessionResponse;
}

export async function middleware(request: NextRequest) {
  const hostname = normalizeHostname(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
  const { pathname, search } = request.nextUrl;
  const onAdminHost = isAdminHost(hostname);

  if (!onAdminHost && pathname.startsWith("/admin")) {
    const dest = redirectMainAdminToSubdomain(pathname, search);
    return NextResponse.redirect(dest, 307);
  }

  const sessionResponse = await updateSession(request);

  if (onAdminHost && !isAdminPassthroughPath(pathname)) {
    let internalPath = pathname.startsWith("/admin")
      ? pathname
      : toAdminInternalPath(pathname);

    if (pathname === "/") {
      internalPath = await resolveAdminRootInternal(request);
    }

    let response: NextResponse = sessionResponse;

    if (internalPath !== pathname) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = internalPath;
      response = NextResponse.rewrite(rewriteUrl);
      copyCookies(sessionResponse, response);
    }

    return guardAdminRoute(request, internalPath, response, hostname);
  }

  if (pathname.startsWith("/admin")) {
    return guardAdminRoute(request, pathname, sessionResponse, hostname);
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
