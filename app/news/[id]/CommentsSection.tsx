"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare, Send, Loader2, Clock, AtSign, LogIn,
  ThumbsUp, Heart, Lightbulb,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

type Reaction = "like" | "love" | "insightful";

const REACTION_META: { id: Reaction; label: string; icon: React.ElementType; active: string }[] = [
  { id: "like",       label: "Like",       icon: ThumbsUp,  active: "bg-brand-50 border-brand-300 text-brand-700" },
  { id: "love",       label: "Love",       icon: Heart,     active: "bg-red-50 border-red-300 text-red-600" },
  { id: "insightful", label: "Insightful", icon: Lightbulb, active: "bg-amber-50 border-amber-300 text-amber-600" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CommentsSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);

  const [counts, setCounts] = useState<Record<Reaction, number>>({ like: 0, love: 0, insightful: 0 });
  const [mine, setMine]     = useState<Reaction | null>(null);
  const [reacting, setReacting] = useState(false);

  const [body, setBody]       = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");

  const loadReactions = useCallback(async () => {
    const res = await fetch(`/api/articles/${articleId}/reactions`, {
      headers: await authHeaders(),
    }).catch(() => null);
    if (!res?.ok) return;
    const data = await res.json();
    setCounts(data.counts);
    setMine(data.mine);
  }, [articleId, user]);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/comments`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setComments(data); })
      .finally(() => setLoading(false));
  }, [articleId]);

  useEffect(() => { loadReactions(); }, [loadReactions]);

  async function react(reaction: Reaction) {
    if (!user) {
      window.location.href = `/auth/login?next=/news/${articleId}`;
      return;
    }
    if (reacting) return;
    setReacting(true);

    // Optimistic update
    const prevMine = mine;
    const next = prevMine === reaction ? null : reaction;
    setMine(next);
    setCounts((c) => {
      const copy = { ...c };
      if (prevMine) copy[prevMine] = Math.max(0, copy[prevMine] - 1);
      if (next) copy[next]++;
      return copy;
    });

    const res = await fetch(`/api/articles/${articleId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ reaction }),
    }).catch(() => null);
    if (!res?.ok) loadReactions(); // roll back to server truth
    setReacting(false);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) { setError("Please write a comment before posting."); return; }
    setSending(true);
    setError("");
    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({
        author_name: user!.screen_name,
        body: body.trim(),
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to post comment.");
      setSending(false);
      return;
    }
    const newComment = await res.json();
    setComments((prev) => [...prev, newComment]);
    setBody("");
    setSending(false);
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-sm font-semibold text-gray-500 mr-1">Was this useful?</span>
        {REACTION_META.map(({ id, label, icon: Icon, active }) => (
          <button
            key={id}
            onClick={() => react(id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
              mine === id ? active : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icon className={`w-4 h-4 ${mine === id && id === "love" ? "fill-red-500 text-red-500" : ""}`} />
            {label}
            {counts[id] > 0 && <span className="text-xs">{counts[id]}</span>}
          </button>
        ))}
      </div>

      {/* Comments header */}
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-brand-500" />
        {comments.length > 0
          ? `${comments.length} ${comments.length === 1 ? "Comment" : "Comments"}`
          : "Comments"}
      </h2>

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 mb-6">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs uppercase">
                {c.author_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">@{c.author_name}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {timeAgo(c.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {!user ? (
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
          <LogIn className="w-5 h-5 text-gray-400 shrink-0" />
          <p className="text-sm text-gray-600 flex-1">Sign in to join the discussion.</p>
          <Link
            href={`/auth/login?next=/news/${articleId}`}
            className="shrink-0 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
      ) : !user.screen_name ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AtSign className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            Choose a screen name to comment — your real identity stays private.
          </p>
          <Link
            href="/dashboard/individual/profile"
            className="shrink-0 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Set now
          </Link>
        </div>
      ) : (
        <form onSubmit={submitComment} className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold">
            <AtSign className="w-3.5 h-3.5" />
            Commenting as @{user.screen_name}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What do you think about this?"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
          )}
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Send className="w-3.5 h-3.5" /> {sending ? "Posting…" : "Post Comment"}
          </button>
        </form>
      )}
    </div>
  );
}
