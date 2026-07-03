"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Megaphone, Loader2, CheckCircle2, XCircle, Hourglass, Clock,
  MapPin, ExternalLink, AtSign,
} from "lucide-react";
import clsx from "clsx";

interface Report {
  id: string;
  author_name: string;
  title: string;
  body: string;
  area: string | null;
  image_url: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  article_id: string | null;
  created_at: string;
  reviewed_at: string | null;
}

type Filter = "pending" | "approved" | "rejected" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "pending",  label: "Pending"   },
  { id: "approved", label: "Published" },
  { id: "rejected", label: "Rejected"  },
  { id: "all",      label: "All"       },
];

const STATUS_BADGE = {
  pending:  { label: "Pending",   icon: Hourglass,    cls: "bg-amber-50 text-amber-700" },
  approved: { label: "Published", icon: CheckCircle2, cls: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected",  icon: XCircle,      cls: "bg-red-50 text-red-600" },
} as const;

export default function AdminCitizenReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<Filter>("pending");
  const [acting, setActing]   = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote]       = useState("");
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/citizen-reports?status=${filter}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function review(id: string, action: "approve" | "reject") {
    setActing(id);
    setError("");
    const res = await fetch(`/api/admin/citizen-reports/${id}`, {
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

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">
      {/* Header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-brand-500" /> Citizen Reports
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Resident-submitted local news. Approving publishes to News under Community.
          </p>
        </div>
        <div className="flex gap-1.5">
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
              {f.id === "pending" && filter === "pending" && pendingCount > 0 && ` (${pendingCount})`}
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
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">
            {filter === "pending" ? "No reports awaiting review" : "No reports here"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Residents submit local news from the &quot;Report Local News&quot; page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const badge = STATUS_BADGE[r.status];
            return (
              <div key={r.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={clsx("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", badge.cls)}>
                    <badge.icon className="w-3 h-3" /> {badge.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-semibold">
                    <AtSign className="w-3 h-3" /> {r.author_name}
                  </span>
                  {r.area && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" /> {r.area}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                    <Clock className="w-3 h-3" />
                    {new Date(r.created_at).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="font-bold text-gray-900">{r.title}</p>
                <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap">{r.body}</p>

                {r.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt={r.title} className="mt-3 h-40 rounded-xl object-cover" />
                )}

                {r.status === "approved" && r.article_id && (
                  <Link
                    href={`/news/${r.article_id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 text-xs font-semibold mt-3"
                  >
                    <ExternalLink className="w-3 h-3" /> View published article
                  </Link>
                )}
                {r.status === "rejected" && r.admin_note && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-3">
                    Note sent to reporter: {r.admin_note}
                  </p>
                )}

                {r.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    {rejecting === r.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={2}
                          maxLength={500}
                          placeholder="Optional note to the reporter (why it wasn't published)…"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => review(r.id, "reject")}
                            disabled={acting === r.id}
                            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                          >
                            {acting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => { setRejecting(null); setNote(""); }}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => review(r.id, "approve")}
                          disabled={acting === r.id}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                          {acting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Approve &amp; Publish
                        </button>
                        <button
                          onClick={() => { setRejecting(r.id); setNote(""); }}
                          className="flex items-center gap-1.5 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
