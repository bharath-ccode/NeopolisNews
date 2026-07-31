import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

/** GET ?builder_id= — site-visit bookings across the builder's projects. */
export async function GET(req: NextRequest) {
  const builderId = req.nextUrl.searchParams.get("builder_id");
  if (!builderId) return NextResponse.json({ error: "builder_id required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: projects } = await admin
    .from("projects")
    .select("id, project_name")
    .eq("builder_id", builderId);
  const ids = (projects ?? []).map((p) => p.id);
  if (ids.length === 0) return NextResponse.json([]);

  const nameMap = new Map((projects ?? []).map((p) => [p.id, p.project_name]));

  const { data, error } = await admin
    .from("site_visit_bookings")
    .select("id, project_id, visitor_name, visitor_phone, preferred_date, preferred_slot, note, status, created_at")
    .in("project_id", ids)
    .order("preferred_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map((b) => ({ ...b, project_name: nameMap.get(b.project_id) ?? "Project" }))
  );
}

/** PATCH { id, status } — update a booking's status. */
export async function PATCH(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { id, status } = body as { id?: string; status?: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!status || !STATUSES.includes(status as (typeof STATUSES)[number]))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_visit_bookings")
    .update({ status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
