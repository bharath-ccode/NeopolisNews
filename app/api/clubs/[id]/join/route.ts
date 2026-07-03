import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { refreshMemberCount } from "@/lib/clubs";

export const dynamic = "force-dynamic";

/** POST { user_id, member_name } — toggle membership. Leads cannot leave. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, member_name } = body as { user_id?: string; member_name?: string };
  if (!user_id) return NextResponse.json({ error: "Sign in to join." }, { status: 401 });

  const admin = createAdminClient();

  const { data: club } = await admin
    .from("clubs")
    .select("id, status")
    .eq("id", params.id)
    .single();
  if (!club || club.status !== "active")
    return NextResponse.json({ error: "Club not found" }, { status: 404 });

  const { data: existing } = await admin
    .from("club_members")
    .select("id, role")
    .eq("club_id", params.id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existing) {
    if (existing.role === "lead")
      return NextResponse.json({ error: "The club lead can't leave their own club." }, { status: 400 });
    const { error } = await admin.from("club_members").delete().eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await refreshMemberCount(admin, params.id);
    return NextResponse.json({ member: false });
  }

  if (!member_name?.trim())
    return NextResponse.json({ error: "member_name required" }, { status: 400 });

  const { error } = await admin
    .from("club_members")
    .insert({ club_id: params.id, user_id, member_name: member_name.trim() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await refreshMemberCount(admin, params.id);
  return NextResponse.json({ member: true }, { status: 201 });
}
