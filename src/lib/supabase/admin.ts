import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseConfig } from "./config";

/**
 * Service-role client. SERVER ONLY — never import in client components.
 * Bypasses RLS; used for reading payment channel secrets and for
 * webhook handlers that have no user session (card allocation).
 */
export function createSupabaseAdminClient() {
  const { supabaseUrl } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Required for payments and webhooks.",
    );
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
