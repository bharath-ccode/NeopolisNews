import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return NextResponse.json([]);

  const anon = createClient();
  const { data: { user } } = await anon.auth.getUser(token);
  if (!user) return NextResponse.json([]);

  const admin = createAdminClient();
  const { data } = await admin
    .from("session_enrollments")
    .select("session_id")
    .eq("user_id", user.id)
    .eq("payment_status", "claimed");

  return NextResponse.json((data ?? []).map((r) => r.session_id));
}
