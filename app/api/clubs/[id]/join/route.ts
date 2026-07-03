import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { refreshMemberCount } from "@/lib/clubs";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

/** POST { member_name } — toggle membership (token-verified). Leads cannot leave. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { member_name } = body as { member_name?: string };

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
