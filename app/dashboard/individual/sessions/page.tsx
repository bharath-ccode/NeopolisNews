"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video, ExternalLink, Calendar, Loader2, IndianRupee } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Enrollment {
  id: string;
  amount_inr: number;
  enrolled_at: string;
  paid_at: string | null;
  wellness_sessions: {
    id: string;
    trainer_name: string;
    session_type: string;
    language: string;
    platform: string;
    platform_label: string;
    start_date: string;
    end_date: string;
    status: string;
  };
}

interface JoinCache { [sessionId: string]: string | null }

const PLATFORM_COLOR: Record<string, string> = {
  zoom:    "bg-blue-50 text-blue-700 border-blue-200",
  meet:    "bg-green-50 text-green-700 border-green-200",
  teams:   "bg-indigo-50 text-indigo-700 border-indigo-200",
  webex:   "bg-red-50 text-red-700 border-red-200",
  youtube: "bg-red-50 text-red-600 border-red-200",
  other:   "bg-gray-50 text-gray-700 border-gray-200",
};

export default function MySessionsPage() {
  const supabase = createClient();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [joinLinks, setJoinLinks] = useState<JoinCache>({});
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setToken(session.access_token);

      const res = await fetch("/api/wellness-sessions/my-enrollments", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setEnrollments(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getJoinLink(sessionId: string) {
    if (joinLinks[sessionId] !== undefined || !token) return;
    setFetchingId(sessionId);
    const res = await fetch(`/api/wellness-sessions/${sessionId}/join`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setJoinLinks((prev) => ({ ...prev, [sessionId]: res.ok ? data.meeting_link : null }));
    setFetchingId(null);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-16">
        <Video className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">No sessions yet</h3>
        <p className="text-sm text-gray-500 mb-5">Browse live wellness sessions and enroll to join.</p>
        <Link href="/health/wellness" className="btn-primary text-sm">Browse Sessions</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-extrabold text-gray-900 text-lg">My Sessions</h2>
        <Link href="/health/wellness" className="text-xs text-brand-600 hover:underline font-semibold">Browse more →</Link>
      </div>

      {enrollments.map((e) => {
        const s = e.wellness_sessions;
        const link = joinLinks[s.id];
        const isLive = s.status === "live";
        return (
          <div key={e.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">{s.session_type}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PLATFORM_COLOR[s.platform] ?? PLATFORM_COLOR.other}`}>{s.platform_label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isLive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {isLive ? "Live" : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{s.session_type} with {s.trainer_name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(s.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                    {new Date(s.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />{e.amount_inr.toLocaleString("en-IN")} paid
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Join on {s.platform_label}
                </a>
              ) : link === null ? (
                <p className="text-xs text-gray-400">Meeting link not available yet.</p>
              ) : (
                <button
                  onClick={() => getJoinLink(s.id)}
                  disabled={fetchingId === s.id}
                  className="inline-flex items-center gap-2 border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  {fetchingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
                  {fetchingId === s.id ? "Loading…" : "Get Meeting Link"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
