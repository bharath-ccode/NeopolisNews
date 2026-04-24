"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Users, Send, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

interface Stats {
  total: number;
  active: number;
}

export default function AdminDigestPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/digest/stats")
      .then((r) => r.json())
      .then((data) => { if (data.total !== undefined) setStats(data); })
      .catch(() => {});
  }, []);

  async function sendDigest() {
    if (!confirm(`Send weekly digest to ${stats?.active ?? "all"} subscribers?`)) return;
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/digest/send", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send digest."); return; }
      setResult(data);
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-gray-900">
            Neopolis<span className="text-brand-600">News</span>
          </span>
          <span className="ml-2 text-xs text-gray-400">/ Admin / Digest</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">

        {/* Subscriber stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{stats?.total ?? "—"}</p>
              <p className="text-xs text-gray-500">Total subscribers</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{stats?.active ?? "—"}</p>
              <p className="text-xs text-gray-500">Active subscribers</p>
            </div>
          </div>
        </div>

        {/* Send digest */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-1">Send Weekly Digest</h2>
          <p className="text-gray-500 text-sm mb-5">
            Sends the latest 4 published articles and up to 3 featured businesses
            to all active subscribers via Resend.
          </p>

          {result ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">Digest sent!</p>
                <p className="text-green-700 text-xs mt-0.5">
                  {result.sent} delivered · {result.failed} failed · {result.total} total
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}
              <button
                onClick={sendDigest}
                disabled={sending || (stats?.active ?? 0) === 0}
                className="btn-primary disabled:opacity-60"
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Digest Now</>
                }
              </button>
              {(stats?.active ?? 0) === 0 && !sending && (
                <p className="text-xs text-gray-400 mt-2">No active subscribers to send to.</p>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div className="card p-5 border-dashed">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Tip:</strong> To automate Monday sends, set up a cron job
            (e.g. via Vercel Cron or a GitHub Action) that calls{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">POST /api/admin/digest/send</code> weekly.
          </p>
        </div>
      </div>
    </div>
  );
}
