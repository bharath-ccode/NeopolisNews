import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export interface AuthedUser {
  id: string;
  email: string | null;
}

type AuthResult =
  | { ok: true; user: AuthedUser }
  | { ok: false; status: number; error: string };

function bearerToken(req: NextRequest): string {
  return (req.headers.get("authorization") ?? "").replace(/^Bearer /i, "").trim();
}

/** Verify the caller's Supabase JWT. The token's identity is authoritative —
 *  never trust a user_id sent in the request body or query string. */
export async function requireUser(req: NextRequest): Promise<AuthResult> {
  const token = bearerToken(req);
  if (!token) return { ok: false, status: 401, error: "Sign in required." };

  const admin = createAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return { ok: false, status: 401, error: "Invalid or expired session." };

  return { ok: true, user: { id: user.id, email: user.email ?? null } };
}

/** Like requireUser but tolerant: returns null when no/invalid token instead
 *  of an error. For public GETs that personalize when signed in. */
export async function optionalUser(req: NextRequest): Promise<AuthedUser | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const admin = createAdminClient();
  const { data: { user } } = await admin.auth.getUser(token);
  return user ? { id: user.id, email: user.email ?? null } : null;
}
