import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

async function resolveUser(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const anon = createClient();
  const { data: { user } } = await anon.auth.getUser(token);
  return user ?? null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await resolveUser(req);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_session_slot", {
    p_session_id: params.id,
    p_user_id: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const result = data as { success: boolean; message: string; remaining: number };
  if (!result.success) return NextResponse.json({ error: result.message, remaining: result.remaining }, { status: 409 });
  return NextResponse.json({ ok: true, remaining: result.remaining });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await resolveUser(req);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("unclaim_session_slot", {
    p_session_id: params.id,
    p_user_id: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
