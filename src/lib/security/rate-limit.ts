import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const WINDOW_MS = 60_000;

type RateLimitOptions = {
  /** e.g. "lookup:203.0.113.1" */
  bucket: string;
  max: number;
  windowMs?: number;
};

/**
 * Simple DB-backed rate limit (service role). Requires api_rate_limits table.
 * Returns true if the request is allowed.
 */
export async function checkRateLimit({
  bucket,
  max,
  windowMs = WINDOW_MS,
}: RateLimitOptions): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const since = new Date(Date.now() - windowMs).toISOString();

  const { count, error: countError } = await admin
    .from("api_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("bucket", bucket)
    .gte("created_at", since);

  if (countError) {
    // Fail open if table missing during rollout — log in server console
    console.error("[rate-limit]", countError.message);
    return true;
  }

  if ((count ?? 0) >= max) {
    return false;
  }

  const { error: insertError } = await admin
    .from("api_rate_limits")
    .insert({ bucket });

  if (insertError) {
    console.error("[rate-limit] insert", insertError.message);
  }

  return true;
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
