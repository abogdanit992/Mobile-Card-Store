import { headers } from "next/headers";
import {
  adminExternalPath,
  getAdminOrigin,
  isAdminHost,
  normalizeHostname,
} from "@/lib/host";

export async function getRequestHostname(): Promise<string> {
  const h = await headers();
  return normalizeHostname(h.get("x-forwarded-host") ?? h.get("host"));
}

/** Link target for admin UI (respects admin subdomain). */
export async function adminHref(internalPath: string): Promise<string> {
  const host = await getRequestHostname();
  const path = internalPath.startsWith("/admin")
    ? internalPath
    : `/admin${internalPath === "/" ? "" : internalPath}`;
  if (isAdminHost(host)) {
    return adminExternalPath(path);
  }
  return path;
}

export async function adminLoginHref(): Promise<string> {
  const host = await getRequestHostname();
  return isAdminHost(host) ? "/login" : "/admin/login";
}

export function adminLoginPathForHost(hostname: string): string {
  return isAdminHost(hostname) ? "/login" : "/admin/login";
}

export function adminDashboardPathForHost(hostname: string): string {
  return isAdminHost(hostname) ? "/" : "/admin";
}

export function redirectMainAdminToSubdomain(pathname: string, search: string): string {
  const external = adminExternalPath(pathname) || "/login";
  return `${getAdminOrigin()}${external}${search}`;
}
