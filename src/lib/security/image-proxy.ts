const DEFAULT_ALLOWED_HOSTS = [
  "vipfkk.com",
  "supabase.co",
  "supabase.in",
];

function allowedHosts(): string[] {
  const extra = process.env.IMAGE_PROXY_ALLOWED_HOSTS?.split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_HOSTS, ...(extra ?? [])];
}

/** Returns true when the URL is safe to proxy as an image. */
export function isAllowedImageProxyUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  const allowed = allowedHosts();

  return allowed.some(
    (h) => host === h || host.endsWith(`.${h}`),
  );
}
