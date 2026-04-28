"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, MessageSquare, Clock, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getIndustries, getTypes } from "@/lib/businessDirectory";

interface Reply {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}
interface Post {
  id: string;
  author_name: string;
  title: string;
  body: string;
  industry: string | null;
  type: string | null;
  reply_count: number;
  status: string;
  created_at: string;
}

const INDUSTRY_EMOJI: Record<string, string> = {
  "Entertainment":    "🎬",
  "Events":           "🎉",
  "Food & Beverages": "🍽️",
  "Health & Wellness":"💊",
  "Retail":           "🛍️",
  "Services":         "🔧",
  "Education":        "🎓",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm uppercase">
      {name.charAt(0)}
    </div>
  );
}

export default function ForumThreadPage() {
  const { id }      = useParams<{ id: string }>();
  const { user }    = useAuth();

  const [post,       setPost]       = useState<Post | null>(null);
  const [replies,    setReplies]    = useState<Reply[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);

  const [replyBody,  setReplyBody]  = useState("");
  const [replyName,  setReplyName]  = useState(user?.name ?? "");
  const [sending,    setSending]    = useState(false);
  const [replyError, setReplyError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Admin recategorize state
  const { user: authUser } = useAuth();
  const isAdmin = false; // replace with admin context check if available
  const [editCat,     setEditCat]     = useState(false);
  const [newIndustry, setNewIndustry] = useState("");
  const [newType,     setNewType]     = useState("");
  const [saving,      setSaving]      = useState(false);

  const industries = getIndustries();
  const types      = newIndustry ? getTypes(newIndustry) : [];

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/forum/${id}`).catch(() => null);
    if (!res?.ok) { setNotFound(true); setLoading(false); return; }
    const data = await res.json();
    setPost(data.post);
    setReplies(data.replies);
    setNewIndustry(data.post.industry ?? "");
    setNewType(data.post.type ?? "");
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyName.trim() || !replyBody.trim()) {
      setReplyError("Please enter your name and reply.");
      return;
    }
    setSending(true);
    setReplyError("");
    const res = await fetch(`/api/forum/${id}/reply`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ author_name: replyName.trim(), body: replyBody.trim(), user_id: user?.id ?? null }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setReplyError((j as { error?: string }).error ?? "Failed to post reply.");
      setSending(false);
      return;
    }
    const newReply = await res.json();
    setReplies(prev => [...prev, newReply]);
    setPost(prev => prev ? { ...prev, reply_count: prev.reply_count + 1 } : prev);
    setReplyBody("");
    setSending(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function saveCategory() {
    setSaving(true);
    await fetch(`/api/forum/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ industry: newIndustry || null, type: newType || null }),
    });
    setPost(prev => prev ? { ...prev, industry: newIndustry || null, type: newType || null } : prev);
    setEditCat(false);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }
  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 text-gray-500">
        <MessageSquare size={40} className="opacity-30" />
        <p className="font-semibold">Thread not found</p>
        <Link href="/forum" className="text-brand-600 text-sm hover:underline">← Back to Forum</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-950 text-white px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/forum" className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft size={15} /> Community Forum
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Original post */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <Avatar name={post.author_name} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-bold text-gray-800 text-sm">{post.author_name}</span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} /> {timeAgo(post.created_at)}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-snug mb-3">{post.title}</h1>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

              {/* Category badge */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {post.industry ? (
                  <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {INDUSTRY_EMOJI[post.industry] ?? "📌"} {post.industry}
                    {post.type && <><ChevronRight size={10} className="opacity-50" />{post.type}</>}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic">Uncategorized</span>
                )}

                {/* Admin/anyone can suggest a category */}
                {!editCat ? (
                  <button
                    onClick={() => setEditCat(true)}
                    className="text-xs text-brand-500 hover:text-brand-700 font-medium transition-colors"
                  >
                    {post.industry ? "Edit category" : "+ Add category"}
                  </button>
                ) : (
                  <div className="w-full mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <p className="text-xs font-semibold text-gray-600">Set category</p>
                    <div className="flex gap-2">
                      <select
                        value={newIndustry}
                        onChange={e => { setNewIndustry(e.target.value); setNewType(""); }}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                      >
                        <option value="">— Industry —</option>
                        {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                      <select
                        value={newType}
                        onChange={e => setNewType(e.target.value)}
                        disabled={!newIndustry}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white disabled:bg-gray-50"
                      >
                        <option value="">— Type —</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveCategory}
                        disabled={saving}
                        className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 disabled:opacity-60 transition-colors"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditCat(false)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
            </h2>
            <div className="space-y-3">
              {replies.map((r, i) => (
                <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={r.author_name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-bold text-gray-800 text-sm">{r.author_name}</span>
                        {i === 0 && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">First reply</span>}
                        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                          <Clock size={11} /> {timeAgo(r.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{r.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />

        {/* Reply form */}
        {post.status === "closed" ? (
          <div className="text-center text-sm text-gray-500 bg-white rounded-2xl py-6 border border-gray-100">
            This thread has been closed.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-brand-500" /> Add your reply
            </h3>
            <form onSubmit={submitReply} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={replyName}
                  onChange={e => setReplyName(e.target.value)}
                  placeholder="Your name"
                  maxLength={60}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div>
                <textarea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  rows={4}
                  placeholder="Share your experience, recommendation, or advice…"
                  maxLength={2000}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                />
              </div>
              {replyError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{replyError}</p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Send size={14} /> {sending ? "Posting…" : "Post Reply"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
