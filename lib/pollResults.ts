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
      .select("id, label")
      .eq("poll_id", poll.id)
      .order("position", { ascending: true }),
    admin.from("poll_votes").select("option_id, user_id").eq("poll_id", poll.id),
  ]);

  const counts: Record<string, number> = {};
  for (const v of votes ?? []) counts[v.option_id] = (counts[v.option_id] ?? 0) + 1;

  const myVote = userId
    ? (votes ?? []).find((v) => v.user_id === userId)?.option_id ?? null
    : null;

  return {
    id: poll.id,
    question: poll.question,
    publish_date: poll.publish_date,
    options: (options ?? []).map((o) => ({ id: o.id, label: o.label, votes: counts[o.id] ?? 0 })),
    totalVotes: (votes ?? []).length,
    myVote,
  };
}
