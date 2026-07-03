"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Loader2, Send, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Thread {
  id: string;
  listing_title: string;
  other_name: string;
  am_seller: boolean;
  last_message_at: string;
  unread: number;
}
interface Message {
  id: string;
  sender_user_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [threads, setThreads]   = useState<Thread[]>([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [draft, setDraft]       = useState("");
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`/api/messages?user_id=${user.id}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setThreads(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  async function openThread(t: Thread) {
    setActive(t);
    setLoadingMsgs(true);
    const res = await fetch(`/api/messages/${t.id}?user_id=${user!.id}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setMessages(data.messages ?? []);
      setThreads((prev) => prev.map((x) => (x.id === t.id ? { ...x, unread: 0 } : x)));
    }
    setLoadingMsgs(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    setSending(true);
    const res = await fetch(`/api/messages/${active.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user!.id,
        sender_name: user!.screen_name ?? user!.name,
        body: draft.trim(),
      }),
    }).catch(() => null);
    if (res?.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setSending(false);
  }

  if (authLoading || loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>;
  }

  /* Thread detail */
  if (active) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setActive(null); loadThreads(); }}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="w-4 h-4" /> All messages
        </button>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center uppercase shrink-0">
            {active.other_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-gray-900">@{active.other_name}</p>
            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
              <Home className="w-3 h-3 shrink-0" /> {active.listing_title}
            </p>
          </div>
        </div>

        <div className="card p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {loadingMsgs ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-300 mx-auto" />
          ) : (
            messages.map((m) => {
              const mine = m.sender_user_id === user!.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine ? "bg-brand-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? "text-brand-200" : "text-gray-400"}`}>
                      {timeAgo(m.created_at)} ago
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={reply} className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={2000}
            placeholder="Write a message…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="btn-primary text-sm py-2 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  /* Thread list */
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-500" /> Messages
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Conversations with buyers and sellers on property listings.
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">No conversations yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Use &quot;Message seller&quot; on any property listing to start one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => openThread(t)}
              className={`card p-4 w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow ${
                t.unread > 0 ? "border-l-4 border-l-brand-500" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center uppercase shrink-0">
                {t.other_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-gray-900">@{t.other_name}</p>
                  {t.am_seller && (
                    <span className="text-[10px] bg-cyan-50 text-cyan-700 font-bold px-2 py-0.5 rounded-full">BUYER</span>
                  )}
                  {t.unread > 0 && (
                    <span className="text-[10px] bg-brand-600 text-white font-bold px-2 py-0.5 rounded-full">
                      {t.unread} new
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto shrink-0">{timeAgo(t.last_message_at)}</span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{t.listing_title}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
