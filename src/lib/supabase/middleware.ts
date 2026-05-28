import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        request.cookies.set(name, value);
        supabaseResponse = NextResponse.next({ request });
        supabaseResponse.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        request.cookies.set(name, "");
        supabaseResponse = NextResponse.next({ request });
        supabaseResponse.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  await supabase.auth.getUser();
  return supabaseResponse;
}
