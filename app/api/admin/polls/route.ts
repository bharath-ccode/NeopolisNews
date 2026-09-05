import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const { data: polls, error } = await admin
    .from("polls")
    .select("id, question, publish_date, status, created_at")
    .order("publish_date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (polls ?? []).map((p) => p.id);
  const { data: options } = ids.length
    ? await admin
        .from("poll_options")
        .select("id, poll_id, label, position")
        .in("poll_id", ids)
        .order("position", { ascending: true })
    : { data: [] as { id: string; poll_id: string; label: string }[] };

  const byPoll: Record<string, { id: string; label: string }[]> = {};
  for (const o of options ?? []) {
    (byPoll[o.poll_id] ??= []).push({ id: o.id, label: o.label });
  }

  return NextResponse.json((polls ?? []).map((p) => ({ ...p, options: byPoll[p.id] ?? [] })));
}

/** POST { question, publish_date, options: {label, seedVotes?}[], status? }
 *  Upserts by publish_date (one poll/day, like the daily cartoon). Options
 *  are replaced wholesale on each save — fine pre-publish, but re-saving a
 *  poll that already has votes resets its results since option rows (and
 *  their cascaded votes) are recreated. seedVotes is an admin-set starting
 *  count per option (real votes add on top) — same "decorative baseline"
 *  treatment as cartoon view/share counts. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { question, publish_date, options, status } = body ?? {};

  if (!question?.trim()) return NextResponse.json({ error: "question required" }, { status: 400 });
  if (!publish_date) return NextResponse.json({ error: "publish_date required" }, { status: 400 });

  const cleanOptions: { label: string; seedVotes: number }[] = Array.isArray(options)
    ? options
        .map((o: { label?: string; seedVotes?: number }) => ({
          label: (o?.label ?? "").trim(),
          seedVotes: Math.max(0, Math.floor(Number(o?.seedVotes) || 0)),
        }))
        .filter((o) => o.label)
    : [];
  if (cleanOptions.length < 2)
    return NextResponse.json({ error: "At least 2 options required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: poll, error } = await admin
    .from("polls")
    .upsert(
      {
        question: question.trim(),
        publish_date,
        status: status === "published" ? "published" : "draft",
      },
      { onConflict: "publish_date" }
    )
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("poll_options").delete().eq("poll_id", poll.id);
  const { error: optErr } = await admin
    .from("poll_options")
    .insert(
      cleanOptions.map((o, i) => ({ poll_id: poll.id, label: o.label, position: i, seed_votes: o.seedVotes }))
    );
  if (optErr) return NextResponse.json({ error: optErr.message }, { status: 500 });

  return NextResponse.json({ id: poll.id }, { status: 201 });
}
