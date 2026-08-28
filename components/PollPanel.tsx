"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, LogIn } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";

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

/** Vote UI for one poll: sign-in prompt → clickable choices → live result
 *  bars once the caller has voted. Shared by the homepage panel and the
 *  /polls archive page. */
export default function PollPanel({
  poll,
  onUpdate,
}: {
  poll: PollResult;
  onUpdate?: (p: PollResult) => void;
}) {
  const { user } = useAuth();
  const [local, setLocal] = useState(poll);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (poll.id !== local.id) setLocal(poll);

  async function vote(optionId: string) {
    setVoting(optionId);
    setError("");
    const res = await fetch(`/api/polls/${local.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ option_id: optionId }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to vote.");
      setVoting(null);
      return;
    }
    const updated = await res.json();
    setLocal(updated);
    onUpdate?.(updated);
    setVoting(null);
  }

  const showResults = Boolean(local.myVote);

  return (
    <div className="space-y-3">
      <p className="font-extrabold text-gray-900">{local.question}</p>

      {!user ? (
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2.5">
          <LogIn className="w-4 h-4 text-gray-400 shrink-0" />
          <p className="text-xs text-gray-600 flex-1">Sign in to vote and see results.</p>
          <Link
            href="/auth/login?next=/polls"
            className="shrink-0 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {local.options.map((o) => {
            const pct = local.totalVotes > 0 ? Math.round((o.votes / local.totalVotes) * 100) : 0;
            const isMine = local.myVote === o.id;

            if (showResults) {
              return (
                <div key={o.id} className="relative overflow-hidden rounded-lg border border-gray-100">
                  <div
                    className={clsx("absolute inset-y-0 left-0", isMine ? "bg-brand-100" : "bg-gray-50")}
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between px-3 py-2 text-sm">
                    <span className={clsx("font-semibold flex items-center gap-1.5", isMine ? "text-brand-700" : "text-gray-700")}>
                      {isMine && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {o.label}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">{pct}%</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={o.id}
                onClick={() => vote(o.id)}
                disabled={voting !== null}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-colors disabled:opacity-60"
              >
                {voting === o.id ? "Voting…" : o.label}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {showResults && (
        <p className="text-xs text-gray-400">
          {local.totalVotes} {local.totalVotes === 1 ? "vote" : "votes"} so far
        </p>
      )}
    </div>
  );
}
