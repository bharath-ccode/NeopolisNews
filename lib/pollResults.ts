import { SupabaseClient } from "@supabase/supabase-js";

export interface PollOptionResult {
  id: string;
  label: string;
  votes: number;
}

export interface PollResult {
  id: string;
  question: string;
  publish_date: string;
  options: PollOptionResult[];
  totalVotes: number;
  myVote: string | null;
}

/** Tallies a poll's votes per option and marks the caller's own vote, if any. */
export async function getPollWithResults(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, any, any>,
  poll: { id: string; question: string; publish_date: string },
  userId?: string | null
): Promise<PollResult> {
  const [{ data: options }, { data: votes }] = await Promise.all([
    admin
      .from("poll_options")
      .select("id, label, seed_votes, anon_votes")
      .eq("poll_id", poll.id)
      .order("position", { ascending: true }),
    admin.from("poll_votes").select("option_id, user_id").eq("poll_id", poll.id),
  ]);

  // seed_votes (admin-entered at creation) and anon_votes (signed-out voters,
  // tallied as a plain counter since there's no stable identity to key a
  // unique constraint on) blend with real signed-in votes into one number.
  const counts: Record<string, number> = {};
  for (const o of options ?? []) counts[o.id] = (o.seed_votes ?? 0) + (o.anon_votes ?? 0);
  for (const v of votes ?? []) counts[v.option_id] = (counts[v.option_id] ?? 0) + 1;

  const myVote = userId
    ? (votes ?? []).find((v) => v.user_id === userId)?.option_id ?? null
    : null;

  return {
    id: poll.id,
    question: poll.question,
    publish_date: poll.publish_date,
    options: (options ?? []).map((o) => ({ id: o.id, label: o.label, votes: counts[o.id] ?? 0 })),
    totalVotes: Object.values(counts).reduce((sum, n) => sum + n, 0),
    myVote,
  };
}
