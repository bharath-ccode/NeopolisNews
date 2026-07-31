import { createClient } from "@/lib/supabase/client";

/** Current Supabase access token (browser), or null when signed out. */
export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await createClient().auth.getSession();
  return session?.access_token ?? null;
}

/** Authorization header object for fetch(); empty when signed out. */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
