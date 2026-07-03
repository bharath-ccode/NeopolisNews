import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isClubLead } from "@/lib/clubs";

export const dynamic = "force-dynamic";

/** POST — lead adds an impact-log entry (plantation drives, cleanups, audits…). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, title, detail, stat_label, stat_value, entry_date } = body as {
    user_id?: string; title?: string; detail?: string;
    stat_label?: string; stat_value?: string; entry_date?: string;
  };

  if (!user_id)       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!title?.trim()) return NextResponse.json({ error: "Please add a title." }, { status: 400 });

  const admin = createAdminClient();
  if (!(await isClubLead(admin, params.id, user_id)))
    return NextResponse.json({ error: "Only the club lead can log impact." }, { status: 403 });

  const { data, error } = await admin
    .from("club_impact_entries")
    .insert({
      club_id:    params.id,
      title:      title.trim(),
      detail:     detail?.trim() || null,
      stat_label: stat_label?.trim() || null,
      stat_value: stat_value?.trim() || null,
      ...(entry_date ? { entry_date } : {}),
    })
    .select("id, title, detail, stat_label, stat_value, entry_date")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
