import { NextResponse } from "next/server";
import { isAllowedImageProxyUrl } from "@/lib/security/image-proxy";

export const runtime = "nodejs";

/**
 * Same-origin (https) proxy for remote images. This fixes "mixed content"
 * blocking when product/platform artwork is hosted on plain http URLs while
 * the storefront runs on https.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("u");

  if (!target || !isAllowedImageProxyUrl(target)) {
    return NextResponse.json({ error: "Invalid or disallowed url." }, { status: 400 });
  }

  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 vkeyshop-image-proxy" },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream error." }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image." }, { status: 415 });
    }

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed." }, { status: 502 });
  }
}
