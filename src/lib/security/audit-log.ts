import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

/** Record a sensitive admin action (best-effort). */
export async function logAdminAudit(
  adminEmail: string,
  action: string,
  detail?: Record<string, unknown>,
) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("admin_audit_log").insert({
      admin_email: adminEmail,
      action,
      detail: (detail ?? null) as Json,
    });
  } catch (err) {
    console.error("[audit]", err);
  }
}
