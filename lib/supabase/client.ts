import { createClient as _createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oasxtubjhtftazqhimnn.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_wJ-SzaHPmsmObfBrW8xRSw_ImEiKey9";

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
