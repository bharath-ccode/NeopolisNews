"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, ArrowRight, Loader2 } from "lucide-react";
import PollPanel, { type PollResult } from "@/components/PollPanel";
import { authHeaders } from "@/lib/authToken";

/** Client-side so voting can carry the reader's auth token and reflect
 *  whether they've already voted — a server-rendered fetch has no session. */
export default function HomePollPanel() {
  const [poll, setPoll] = useState<PollResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/polls", { headers: await authHeaders() }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setPoll(data.latest ?? null);
      }
      setLoading(false);
    })();
  }, []);

  if (!loading && !poll) return null;

  return (
    <div className="card p-5 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" /> Neopolis Poll
        </p>
        <Link
          href="/polls"
          className="text-xs font-semibold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 transition-colors"
        >
          Archive <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : (
        <PollPanel poll={poll!} />
      )}
    </div>
  );
}
