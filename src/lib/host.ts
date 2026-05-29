/** Hostname without port, lowercased. */
export function normalizeHostname(host: string | null | undefined): string {
  if (!host) return "";
  return host.split(":")[0].toLowerCase();
}

export function getConfiguredAdminHost(): string {
  const fromEnv = process.env.ADMIN_HOST?.trim().toLowerCase();
  if (fromEnv) return fromEnv;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const u = new URL(site);
    const apex = u.hostname.replace(/^www\./, "");
    return `admin.${apex}`;
  } catch {
    return "admin.localhost";
  }
}

export function isAdminHost(hostname: string | null | undefined): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return false;
  const adminHost = getConfiguredAdminHost();
  if (host === adminHost) return true;
  if (host.startsWith("admin.")) return true;
  return false;
}

export function getAdminOrigin(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const u = new URL(site);
    return `${u.protocol}//${getConfiguredAdminHost()}`;
  } catch {
    return `http://${getConfiguredAdminHost()}`;
  }
}

/** Paths that are not rewritten on the admin subdomain. */
export function isAdminPassthroughPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next")
  );
}

/** Map public admin-subdomain URL to internal `/admin/*` route. */
export function toAdminInternalPath(pathname: string): string {
  if (isAdminPassthroughPath(pathname) || pathname.startsWith("/admin")) {
    return pathname;
  }
  if (pathname === "/" || pathname === "/login") {
    return "/admin/login";
  }
  return `/admin${pathname}`;
}

/** Map internal `/admin/*` route to public URL on admin subdomain. */
export function adminExternalPath(internalPath: string): string {
  if (!internalPath.startsWith("/admin")) {
    return internalPath;
  }
  const rest = internalPath.slice("/admin".length);
  if (rest === "/login") return "/login";
  // The admin dashboard ("/admin") lives at the subdomain root.
  if (!rest) return "/";
  return rest;
}
