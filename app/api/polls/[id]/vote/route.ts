import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";
import { rateLimit } from "@/lib/rateLimit";
import { getPollWithResults } from "@/lib/pollResults";

export const dynamic = "force-dynamic";

/** POST { option_id } — cast (or change) the caller's vote. One vote per
 *  user per poll, upserted on (poll_id, user_id) so it stays changeable. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimit(req, "poll-vote", { limit: 20, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const option_id = (body as { option_id?: string } | null)?.option_id;
  if (!option_id) return NextResponse.json({ error: "option_id required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: poll } = await admin
    .from("polls")
    .select("id, question, publish_date, status")
    .eq("id", params.id)
    .single();
  if (!poll || poll.status !== "published")
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const { data: option } = await admin
    .from("poll_options")
    .select("id")
    .eq("id", option_id)
    .eq("poll_id", params.id)
    .maybeSingle();
  if (!option) return NextResponse.json({ error: "Invalid option" }, { status: 400 });

  const { error } = await admin
    .from("poll_votes")
    .upsert(
      { poll_id: params.id, option_id, user_id: auth.user.id },
      { onConflict: "poll_id,user_id" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(await getPollWithResults(admin, poll, auth.user.id));
}
