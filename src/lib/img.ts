/**
 * Route plain-http image URLs through our same-origin https proxy so they
 * are not blocked as mixed content. Local paths and https URLs pass through.
 */
export function safeImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  if (/^http:\/\//i.test(url)) return `/api/img?u=${encodeURIComponent(url)}`;
  return url;
}
