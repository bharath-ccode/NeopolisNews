import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { optionalUser } from "@/lib/apiAuth";
import { rateLimit } from "@/lib/rateLimit";
import { getPollWithResults } from "@/lib/pollResults";

export const dynamic = "force-dynamic";

/** POST { option_id } — cast (or change) a vote. Signed-in readers get one
 *  vote per poll, upserted on (poll_id, user_id) so it stays changeable.
 *  Signed-out readers can vote too — there's no stable identity to key a
 *  unique constraint on, so their vote is tallied as a plain counter
 *  (poll_options.anon_votes) instead; the client tracks "already voted"
 *  locally so the same browser doesn't keep re-showing the vote buttons. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimit(req, "poll-vote", { limit: 20, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const user = await optionalUser(req);

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

  if (user) {
    const { error } = await admin
      .from("poll_votes")
      .upsert(
        { poll_id: params.id, option_id, user_id: user.id },
        { onConflict: "poll_id,user_id" }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.rpc("increment_poll_option_votes", { p_option_id: option_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(await getPollWithResults(admin, poll, user?.id));
}
