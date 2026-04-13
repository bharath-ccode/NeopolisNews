import { createClient as _createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oasxtubjhtftazqhimnn.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_wJ-SzaHPmsmObfBrW8xRSw_ImEiKey9";

/** Standard server-side client using the anon key */
export function createClient() {
  return _createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** Admin client that bypasses RLS — server-side only, never expose to browser */
export function createAdminClient() {
  return _createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
