import { createClient as _createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof _createClient> | null = null;

// Singleton so we don't create a new client on every call
export function createClient() {
  if (!client) {
    client = _createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
