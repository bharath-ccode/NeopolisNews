"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Loader2, Users, ChevronRight, Leaf, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { authHeaders } from "@/lib/authToken";

interface LedgerEntry {
  id: string;
  points: number;
  kind: string;
  source_type: string | null;
  description: string;
  created_at: string;
}
interface MyClub {
  club_id: string;
  role: string;
  clubs: { id: string; name: string; emoji: string; category: string; member_count: number } | null;
}

export default function PointsPage() {
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [myClubs, setMyClubs] = useState<MyClub[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [pointsRes, clubsRes] = await Promise.all([
      fetch("/api/points", { headers: await authHeaders() }).then((r) => r.json()).catch(() => null),
      createClient()
        .from("club_members")
        .select("club_id, role, clubs(id, name, emoji, category, member_count)")
        .eq("user_id", user.id),
    ]);
    if (pointsRes && typeof pointsRes.balance === "number") {
      setBalance(pointsRes.balance);
      setEntries(pointsRes.entries ?? []);
    }
    if (Array.isArray(clubsRes?.data)) setMyClubs(clubsRes.data as unknown as MyClub[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  const civicPoints = entries
    .filter((e) => e.points > 0 && e.description.toLowerCase().includes("attended"))
    .reduce((s, e) => s + e.points, 0);

  return (
    <div className="space-y-6">
      {/* Balance */}
      <div className="card p-6 bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-200 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-yellow-400" /> Neopolis Points
        </p>
        <p className="text-4xl font-extrabold mt-2">{balance.toLocaleString("en-IN")}</p>
        <p className="text-sm text-brand-200 mt-1.5">
          Earned by showing up — club events, runs, drives, cleanups.
          {civicPoints > 0 && ` ${civicPoints} from participation so far.`}
        </p>
        <p className="text-xs text-brand-300 mt-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Redemption at local businesses is coming — your balance carries over.
        </p>
      </div>

      {/* My clubs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">My Clubs</h2>
          <Link href="/clubs" className="text-xs font-bold text-brand-600 hover:text-brand-800">
            Browse all clubs →
          </Link>
        </div>
        {myClubs.length === 0 ? (
          <div className="card p-8 text-center">
            <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-3">You haven&apos;t joined any clubs yet.</p>
            <Link href="/clubs" className="btn-primary text-xs py-2 inline-flex">
              Find Your Club
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myClubs.map((m) =>
              m.clubs ? (
                <Link
                  key={m.club_id}
                  href={`/clubs/${m.clubs.id}`}
                  className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group"
                >
                  <span className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl shrink-0">
                    {m.clubs.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 group-hover:text-brand-700 transition-colors">
                      {m.clubs.name}
                      {m.role === "lead" && (
                        <span className="ml-2 text-[10px] bg-brand-600 text-white font-bold px-2 py-0.5 rounded-full align-middle">
                          LEAD
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{m.clubs.member_count} members</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400" />
                </Link>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Points History</h2>
        {entries.length === 0 ? (
          <div className="card p-8 text-center">
            <Leaf className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              No points yet. Join a club, attend an event — points land here automatically.
            </p>
          </div>
        ) : (
          <div className="card divide-y divide-gray-50">
            {entries.map((e) => (
              <div key={e.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{e.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(e.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-extrabold text-sm ${
                    e.points >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {e.points >= 0 ? "+" : ""}{e.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
