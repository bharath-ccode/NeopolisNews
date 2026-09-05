"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PenTool, Loader2, Send, AtSign, LogIn, Trophy, Clock, Eye, Share2 } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";
import WhatsAppShare from "@/components/WhatsAppShare";
import { parseCartoonDialogue } from "@/lib/cartoonCaption";

interface Cartoon {
  id: string;
  title: string;
  image_url: string;
  caption: string | null;
  artist_name: string;
  publish_date: string;
  is_contest: boolean;
  winner_name: string | null;
  winner_caption: string | null;
  view_count: number;
  whatsapp_share_count: number;
}

function fmtCount(n: number) {
  return n.toLocaleString("en-IN");
}
interface CaptionEntry {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function CartoonPage() {
  const { user } = useAuth();
  const [latest, setLatest]   = useState<Cartoon | null>(null);
  const [archive, setArchive] = useState<Cartoon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cartoon | null>(null);

  const [entries, setEntries] = useState<CaptionEntry[]>([]);
  const [draft, setDraft]     = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [entered, setEntered] = useState(false);

  const cartoon = selected ?? latest;

  const load = useCallback(async () => {
    const res = await fetch("/api/cartoons").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setLatest(data.latest);
      setArchive(data.archive ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!cartoon?.is_contest) { setEntries([]); return; }
    fetch(`/api/cartoons/${cartoon.id}/captions`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEntries(data); })
      .catch(() => {});
  }, [cartoon?.id, cartoon?.is_contest]);

  async function submitCaption(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !cartoon) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/cartoons/${cartoon.id}/captions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ author_name: user!.screen_name, body: draft.trim() }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to submit.");
      setSending(false);
      return;
    }
    const entry = await res.json();
    setEntries((prev) => [...prev, entry]);
    setDraft("");
    setEntered(true);
    setSending(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
            <PenTool className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-extrabold">Today in Neopolis</h1>
          <p className="text-gray-400 mt-1">One panel a day from a city under construction.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {!cartoon ? (
          <div className="card p-12 text-center">
            <PenTool className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 text-sm">The first cartoon is on its way</p>
            <p className="text-xs text-gray-400 mt-1">Check back tomorrow morning.</p>
          </div>
        ) : (
          <>
            {/* The cartoon */}
            <div className="card overflow-hidden">
              <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {fmtDate(cartoon.publish_date)}
                </p>
                {selected && (
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800"
                  >
                    ← Back to today&apos;s
                  </button>
                )}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cartoon.image_url} alt={cartoon.title} className="w-full bg-white" />
              <div className="px-6 py-5">
                {/* Title and caption are baked into the art itself at publish
                    time (see bakeCartoonText) — showing them again here would
                    just repeat what's already on the image. The one exception
                    is a caption-contest cartoon after a winner is picked: the
                    winning caption replaces `caption` in the DB but the
                    already-published image is never re-baked, so it's the
                    only place that text appears. */}
                {cartoon.is_contest && cartoon.winner_name && cartoon.caption && (() => {
                  const turns = parseCartoonDialogue(cartoon.caption);
                  if (turns) {
                    const firstSpeaker = turns[0].speaker;
                    return (
                      <div className="mt-1 space-y-2">
                        {turns.map((t, i) => {
                          const isFirst = t.speaker === firstSpeaker;
                          return (
                            <div key={i} className={clsx("flex", isFirst ? "justify-start" : "justify-end")}>
                              <div
                                className={clsx(
                                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                                  isFirst
                                    ? "bg-gray-100 text-gray-700 rounded-bl-sm"
                                    : "bg-brand-50 text-brand-900 rounded-br-sm"
                                )}
                              >
                                <span className="block text-[10px] font-bold uppercase tracking-wide opacity-60 mb-0.5">
                                  {t.speaker}
                                </span>
                                {t.line}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return (
                    <p className="text-gray-600 italic">&ldquo;{cartoon.caption}&rdquo;</p>
                  );
                })()}
                {cartoon.winner_name && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3 inline-flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    Winning caption by @{cartoon.winner_name}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>✏️ {cartoon.artist_name}</span>
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="w-3.5 h-3.5" /> {fmtCount(cartoon.view_count)}
                    </span>
                    <span className="flex items-center gap-1" title="WhatsApp shares">
                      <Share2 className="w-3.5 h-3.5" /> {fmtCount(cartoon.whatsapp_share_count)}
                    </span>
                  </div>
                  <WhatsAppShare title={`😄 ${cartoon.title} — Today in Neopolis`} size="sm" />
                </div>
              </div>
            </div>

            {/* Caption contest */}
            {cartoon.is_contest && !cartoon.winner_name && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" /> Caption Contest
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  This one needs a caption — best entry wins 25 Neopolis Points and their
                  name on the cartoon. One entry per person.
                </p>

                {!user ? (
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                    <LogIn className="w-5 h-5 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-600 flex-1">Sign in to enter the contest.</p>
                    <Link href="/auth/login?next=/cartoon" className="shrink-0 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Sign in
                    </Link>
                  </div>
                ) : !user.screen_name ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <AtSign className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-800 flex-1">Set a screen name to enter — winners are credited by it.</p>
                    <Link href="/dashboard/individual/profile" className="shrink-0 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Set now
                    </Link>
                  </div>
                ) : entered ? (
                  <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                    ✓ Entry received — the winner is announced when the contest closes. Good luck!
                  </p>
                ) : (
                  <form onSubmit={submitCaption} className="flex gap-2">
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      maxLength={150}
                      placeholder="Your funniest caption (150 chars)…"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="btn-primary text-sm py-2 disabled:opacity-60 shrink-0"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                )}
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

                {entries.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-50 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {entries.length} {entries.length === 1 ? "entry" : "entries"} so far
                    </p>
                    {entries.map((e) => (
                      <p key={e.id} className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">@{e.author_name}:</span>{" "}
                        &ldquo;{e.body}&rdquo;
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Archive */}
            {archive.length > 1 && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">From the Archive</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {archive
                    .filter((c) => c.id !== cartoon.id)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelected(c); setEntered(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="card overflow-hidden text-left hover:shadow-md transition-shadow group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.image_url} alt={c.title} className="h-28 w-full object-cover object-top" />
                        <div className="p-3">
                          <p className="text-xs font-bold text-gray-800 group-hover:text-brand-700 line-clamp-1 transition-colors">{c.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(c.publish_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
