"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Loader2, CheckCircle2, XCircle, Hourglass, Archive,
  AtSign, ExternalLink, Clock,
} from "lucide-react";
import clsx from "clsx";
import { CLUB_CATEGORIES } from "@/lib/clubs";

interface Club {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  lead_name: string;
  status: "pending" | "active" | "rejected" | "archived";
  member_count: number;
  admin_note: string | null;
  created_at: string;
}

type Filter = "pending" | "active" | "rejected" | "archived" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "pending",  label: "Pending"  },
  { id: "active",   label: "Active"   },
  { id: "rejected", label: "Rejected" },
  { id: "archived", label: "Archived" },
  { id: "all",      label: "All"      },
];

const STATUS_BADGE = {
  pending:  { label: "Pending",  icon: Hourglass,    cls: "bg-amber-50 text-amber-700" },
  active:   { label: "Active",   icon: CheckCircle2, cls: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", icon: XCircle,      cls: "bg-red-50 text-red-600" },
  archived: { label: "Archived", icon: Archive,      cls: "bg-gray-100 text-gray-500" },
} as const;

const CATEGORY_LABELS = Object.fromEntries(CLUB_CATEGORIES.map((c) => [c.id, c.label]));

export default function AdminClubsPage() {
  const [clubs, setClubs]     = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<Filter>("pending");
  const [acting, setActing]   = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote]       = useState("");
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/clubs?status=${filter}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setClubs(data);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function review(id: string, action: "approve" | "reject" | "archive") {
    setActing(id);
    setError("");
    const res = await fetch(`/api/admin/clubs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, admin_note: action === "reject" ? note.trim() || undefined : undefined }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Action failed.");
      setActing(null);
      return;
    }
    setRejecting(null);
    setNote("");
    setActing(null);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" /> Community Clubs
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Keep the directory small — approve one strong club per activity.
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors",
                filter === f.id
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : clubs.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">
            {filter === "pending" ? "No proposals awaiting review" : "No clubs here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clubs.map((c) => {
            const badge = STATUS_BADGE[c.status];
            return (
              <div key={c.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-xl shrink-0">
                    {c.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <span className={clsx("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full", badge.cls)}>
                        <badge.icon className="w-3 h-3" /> {badge.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                        <Clock className="w-3 h-3" />
                        {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {CATEGORY_LABELS[c.category] ?? c.category} · lead{" "}
                      <span className="inline-flex items-center gap-0.5 font-semibold">
                        <AtSign className="w-3 h-3" />{c.lead_name}
                      </span>
                      {c.status === "active" && <> · {c.member_count} members</>}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">{c.description}</p>
                    {c.admin_note && (
                      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-2">
                        Note: {c.admin_note}
                      </p>
                    )}

                    {c.status === "active" && (
                      <div className="flex gap-3 mt-3">
                        <Link
                          href={`/clubs/${c.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 text-xs font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" /> View club
                        </Link>
                        <button
                          onClick={() => review(c.id, "archive")}
                          disabled={acting === c.id}
                          className="inline-flex items-center gap-1 text-gray-400 hover:text-red-500 text-xs font-semibold"
                        >
                          <Archive className="w-3 h-3" /> Archive
                        </button>
                      </div>
                    )}

                    {c.status === "pending" && (
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        {rejecting === c.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={2}
                              maxLength={500}
                              placeholder="Optional note to the proposer…"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => review(c.id, "reject")}
                                disabled={acting === c.id}
                                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Confirm Reject
                              </button>
                              <button
                                onClick={() => { setRejecting(null); setNote(""); }}
                                className="text-xs font-semibold text-gray-500 px-3"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => review(c.id, "approve")}
                              disabled={acting === c.id}
                              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                            >
                              {acting === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Approve — @{c.lead_name} becomes lead
                            </button>
                            <button
                              onClick={() => { setRejecting(c.id); setNote(""); }}
                              className="flex items-center gap-1.5 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
