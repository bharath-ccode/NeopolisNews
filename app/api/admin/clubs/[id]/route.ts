import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { refreshMemberCount } from "@/lib/clubs";

export const dynamic = "force-dynamic";

/** PATCH { action: "approve" | "reject" | "archive", admin_note? }
 *  Approving also enrolls the proposer as the club's lead member. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { action, admin_note } = body as { action?: string; admin_note?: string };
  if (!action || !["approve", "reject", "archive"].includes(action))
    return NextResponse.json({ error: "action must be approve, reject or archive" }, { status: 400 });

  const admin = createAdminClient();

  const { data: club } = await admin
    .from("clubs")
    .select("id, status, lead_user_id, lead_name")
    .eq("id", params.id)
    .single();
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  if (action === "approve") {
    if (club.status !== "pending")
      return NextResponse.json({ error: `Club is already ${club.status}.` }, { status: 409 });

    const { error } = await admin
      .from("clubs")
      .update({
        status:      "active",
        admin_note:  admin_note?.trim() || null,
        approved_at: new Date().toISOString(),
      })
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // The proposer becomes the club's lead member
    if (club.lead_user_id) {
      await admin.from("club_members").upsert(
        {
          club_id:     params.id,
          user_id:     club.lead_user_id,
          member_name: club.lead_name,
          role:        "lead",
        },
        { onConflict: "club_id,user_id" }
      );
      await refreshMemberCount(admin, params.id);
    }
    return NextResponse.json({ ok: true, status: "active" });
  }

  if (action === "reject" && club.status !== "pending")
    return NextResponse.json({ error: `Club is already ${club.status}.` }, { status: 409 });

  const { error } = await admin
    .from("clubs")
    .update({
      status:     action === "reject" ? "rejected" : "archived",
      admin_note: admin_note?.trim() || null,
    })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: action === "reject" ? "rejected" : "archived" });
}
