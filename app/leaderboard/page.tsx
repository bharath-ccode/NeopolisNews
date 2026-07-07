"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Loader2, Users, Sparkles } from "lucide-react";
import clsx from "clsx";

interface Badge { id: string; emoji: string; label: string; detail: string; }
interface Row {
  rank: number;
  screen_name: string | null;
  points: number;
  activities: number;
  badges: Badge[];
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState<"month" | "all">("month");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRows(data); })
      .finally(() => setLoading(false));
  }, [period]);

  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-extrabold">Neopolis Leaderboard</h1>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">
            Points are earned by showing up — club runs, plantation drives, wellness
            sessions, supporting local businesses. This is who&apos;s building Neopolis.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Period tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {([["month", `This Month (${monthLabel.split(" ")[0]})`], ["all", "All Time"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPeriod(id)}
              className={clsx(
                "px-5 py-2 rounded-full text-sm font-bold transition-colors",
                period === id
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 text-sm">No points earned yet{period === "month" ? " this month" : ""}</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Join a club, attend an event — the board fills up fast.
            </p>
            <Link href="/clubs" className="btn-primary text-xs py-2 inline-flex">
              Browse Clubs
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.rank}
                className={clsx(
                  "card p-4 flex items-center gap-3",
                  r.rank === 1 && "border-yellow-300 bg-gradient-to-r from-yellow-50 to-white"
                )}
              >
                <div className="w-9 text-center shrink-0">
                  {r.rank <= 3 ? (
                    <span className="text-2xl">{MEDALS[r.rank - 1]}</span>
                  ) : (
                    <span className="text-sm font-extrabold text-gray-300">#{r.rank}</span>
                  )}
                </div>
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center uppercase shrink-0">
                  {(r.screen_name ?? "A").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900">
                    {r.screen_name ? `@${r.screen_name}` : "Anonymous resident"}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">
                      {r.activities} {r.activities === 1 ? "activity" : "activities"}
                    </span>
                    {r.badges.map((b) => (
                      <span key={b.id} title={`${b.label} — ${b.detail}`} className="text-sm cursor-default">
                        {b.emoji}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 font-extrabold text-brand-700">
                  {r.points.toLocaleString("en-IN")}
                  <span className="text-xs font-semibold text-gray-400 ml-1">pts</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-8 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Want on the board? <Link href="/clubs" className="text-brand-600 hover:underline font-semibold">Join a club</Link> — every attended event counts.
        </p>
      </div>
    </div>
  );
}
