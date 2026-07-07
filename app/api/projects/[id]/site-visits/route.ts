import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SLOTS = ["morning", "afternoon", "evening"] as const;

/** POST — book a site visit for a project (public). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimit(req, "site-visits", { limit: 3 });
  if (limited) return limited;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { visitor_name, visitor_phone, preferred_date, preferred_slot, note, user_id } = body as {
    visitor_name?: string; visitor_phone?: string; preferred_date?: string;
    preferred_slot?: string; note?: string; user_id?: string;
  };

  if (!visitor_name?.trim())  return NextResponse.json({ error: "Please enter your name." },        { status: 400 });
  if (!visitor_phone?.trim()) return NextResponse.json({ error: "Please enter your phone number." },{ status: 400 });
  if (!preferred_date)        return NextResponse.json({ error: "Please pick a date." },            { status: 400 });
  if (!preferred_slot || !SLOTS.includes(preferred_slot as (typeof SLOTS)[number]))
    return NextResponse.json({ error: "Please pick a time slot." }, { status: 400 });

  const date = new Date(preferred_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(date.getTime()) || date < today)
    return NextResponse.json({ error: "Please pick a date from tomorrow onwards." }, { status: 400 });

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id, project_name")
    .eq("id", params.id)
    .single();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data, error } = await admin
    .from("site_visit_bookings")
    .insert({
      project_id:     params.id,
      user_id:        user_id ?? null,
      visitor_name:   visitor_name.trim(),
      visitor_phone:  visitor_phone.trim(),
      preferred_date,
      preferred_slot,
      note:           note?.trim() || null,
    })
    .select("id, preferred_date, preferred_slot, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
