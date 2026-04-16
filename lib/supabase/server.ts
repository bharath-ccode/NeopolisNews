import { createClient as _createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oasxtubjhtftazqhimnn.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3h0dWJqaHRmdGF6cWhpbW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NDI5NjgsImV4cCI6MjA5MTAxODk2OH0.VliIZEmfLH-qVMlK7QBQIsOh3vZfJt4SyHcBt5bUVU4";

/** Standard server-side client using the anon key */
export function createClient() {
  return _createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** Admin client that bypasses RLS — server-side only, never expose to browser */
export function createAdminClient() {
  return _createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
