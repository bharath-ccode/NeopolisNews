import { createClient as _createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oasxtubjhtftazqhimnn.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3h0dWJqaHRmdGF6cWhpbW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NDI5NjgsImV4cCI6MjA5MTAxODk2OH0.VliIZEmfLH-qVMlK7QBQIsOh3vZfJt4SyHcBt5bUVU4";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): SupabaseClient<any> {
  if (!client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client = _createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}
