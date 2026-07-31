"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, Loader2, Send, CheckCircle2 } from "lucide-react";

const TOPICS = [
  { id: "news",  label: "📰 News subscribers"  },
  { id: "deals", label: "🏷️ Deal subscribers" },
  { id: "clubs", label: "👥 Club subscribers"  },
] as const;

const INPUT = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

export default function AdminNotificationsPage() {
  const [counts, setCounts]   = useState<Record<string, number> | null>(null);
  const [topic, setTopic]     = useState<string>("news");
  const [title, setTitle]     = useState("");
  const [body, setBody]       = useState("");
  const [url, setUrl]         = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState<number | null>(null);
  const [error, setError]     = useState("");

  const loadCounts = useCallback(async () => {
    const res = await fetch("/api/admin/push").catch(() => null);
    if (res?.ok) setCounts(await res.json());
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/admin/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, url: url || undefined, topic }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to send.");
    } else {
      const data = await res.json();
      setResult(data.sent ?? 0);
      setTitle(""); setBody(""); setUrl("");
    }
    setSending(false);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <BellRing className="w-4 h-4 text-brand-500" /> Push Notifications
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Manual broadcast to subscribers. New deals, published articles and club
          events already push automatically — use this for alerts (outages,
          closures) and announcements.
        </p>
      </div>

      {/* Subscriber counts */}
      <div className="grid grid-cols-3 gap-3">
        {TOPICS.map((t) => (
          <div key={t.id} className="card p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{counts?.[t.id] ?? "—"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Compose */}
      <form onSubmit={send} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Send to</label>
          <div className="flex gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  topic === t.id
                    ? "bg-brand-600 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          maxLength={80} placeholder="Title * — e.g. ⚠️ Water outage in Sector 2 today"
          className={INPUT}
        />
        <textarea
          value={body} onChange={(e) => setBody(e.target.value)}
          rows={3} maxLength={200}
          placeholder="Message * — keep it short; this is a lock-screen notification."
          className={`${INPUT} resize-none`}
        />
        <input
          type="text" value={url} onChange={(e) => setUrl(e.target.value)}
          maxLength={200} placeholder="Open link (optional) — e.g. /news/abc123"
          className={INPUT}
        />

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}
        {result !== null && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Sent to {result} subscriber{result === 1 ? "" : "s"}.
          </p>
        )}

        <button
          type="submit"
          disabled={sending || !title.trim() || !body.trim()}
          className="flex items-center gap-2 btn-primary text-sm disabled:opacity-60"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Sending…" : "Send Notification"}
        </button>
      </form>
    </div>
  );
}
