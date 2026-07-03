import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isClubLead } from "@/lib/clubs";

export const dynamic = "force-dynamic";

/** GET ?user_id= — full club page payload: club, events, members, impact, my membership. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.nextUrl.searchParams.get("user_id");
  const admin = createAdminClient();

  const { data: club, error } = await admin
    .from("clubs")
    .select("id, name, category, emoji, description, announcement, lead_name, lead_user_id, status, member_count, created_at")
    .eq("id", params.id)
    .single();
  if (error || !club) return NextResponse.json({ error: "Club not found" }, { status: 404 });
  if (club.status !== "active")
    return NextResponse.json({ error: "This club is not active." }, { status: 404 });

  const [eventsRes, membersRes, impactRes, myMembershipRes, myRegsRes] = await Promise.all([
    admin
      .from("club_events")
      .select("id, title, description, venue, event_date, start_time, fee_inr, member_fee_inr, max_participants, points_award, status, created_at")
      .eq("club_id", params.id)
      .neq("status", "cancelled")
      .order("event_date", { ascending: false }),
    admin
      .from("club_members")
      .select("member_name, role, joined_at")
      .eq("club_id", params.id)
      .order("joined_at", { ascending: true })
      .limit(100),
    admin
      .from("club_impact_entries")
      .select("id, title, detail, stat_label, stat_value, entry_date")
      .eq("club_id", params.id)
      .order("entry_date", { ascending: false })
      .limit(20),
    userId
      ? admin
          .from("club_members")
          .select("role")
          .eq("club_id", params.id)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    userId
      ? admin
          .from("club_event_registrations")
          .select("event_id, payment_status, attended")
          .eq("club_id", params.id)
          .eq("user_id", userId)
      : Promise.resolve({ data: [] }),
  ]);

  // Registration counts per event (for seat caps / attendance UI)
  const eventIds = (eventsRes.data ?? []).map((e) => e.id);
  let regCounts: Record<string, number> = {};
  if (eventIds.length) {
    const { data: regs } = await admin
      .from("club_event_registrations")
      .select("event_id")
      .in("event_id", eventIds);
    regCounts = (regs ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.event_id] = (acc[r.event_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  return NextResponse.json({
    club,
    events: (eventsRes.data ?? []).map((e) => ({ ...e, registered_count: regCounts[e.id] ?? 0 })),
    members: membersRes.data ?? [],
    impact: impactRes.data ?? [],
    my_role: myMembershipRes.data?.role ?? null,
    my_registrations: myRegsRes.data ?? [],
  });
}

/** PATCH { user_id, announcement?, description? } — lead-only edits. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, announcement, description } =
    body as { user_id?: string; announcement?: string | null; description?: string };

  if (!user_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  if (!(await isClubLead(admin, params.id, user_id)))
    return NextResponse.json({ error: "Only the club lead can do this." }, { status: 403 });

  const update: Record<string, unknown> = {};
  if (announcement !== undefined) update.announcement = announcement?.trim() || null;
  if (description  !== undefined) {
    if (!description.trim()) return NextResponse.json({ error: "Description cannot be empty." }, { status: 400 });
    update.description = description.trim();
  }
  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { error } = await admin.from("clubs").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
