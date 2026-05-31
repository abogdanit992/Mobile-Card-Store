import { createSupabaseServerClient } from "@/lib/supabase/server";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** Throws if the current session is not an admin. */
export async function requireAdmin(): Promise<{
  supabase: SupabaseServer;
  email: string;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    throw new AuthError("Unauthorized", 401);
  }

  const email = user.email.trim().toLowerCase();
  const { data: adminRow } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (!adminRow) {
    throw new AuthError("Forbidden", 403);
  }

  return { supabase, email };
}

/** For server actions that return { ok, message }. */
export async function requireAdminForAction(): Promise<
  | { ok: true; supabase: SupabaseServer; email: string }
  | { ok: false; message: string }
> {
  try {
    const session = await requireAdmin();
    return { ok: true, ...session };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, message: err.message };
    }
    throw err;
  }
}

/** For route handlers — returns Response on failure. */
export async function requireAdminRoute(): Promise<
  | { ok: true; supabase: SupabaseServer; email: string }
  | { ok: false; response: Response }
> {
  try {
    const session = await requireAdmin();
    return { ok: true, ...session };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        ok: false,
        response: new Response(err.message, { status: err.status }),
      };
    }
    throw err;
  }
}
