import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Individual-user sessions live in localStorage (see CLAUDE.md), never
  // cookies — middleware.ts is a pass-through — so the only way to identify
  // the caller here is the Bearer token the client sends from its own
  // getSession(), same pattern as club_events/wellness registration.
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const admin = createAdminClient();

  const { data: { user } } = token ? await admin.auth.getUser(token) : { data: { user: null } };
  const userId = user?.id ?? null;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await admin.rpc("claim_event_slot", { event_id: params.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return NextResponse.json({ error: "Sold out" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
