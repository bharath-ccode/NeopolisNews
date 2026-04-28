"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Plus, Clock, ChevronRight } from "lucide-react";
import { getIndustries } from "@/lib/businessDirectory";

interface ForumPost {
  id: string;
  author_name: string;
  title: string;
  body: string;
  industry: string | null;
  type: string | null;
  reply_count: number;
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
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

export default function ForumPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const industries   = getIndustries();

  const activeIndustry = searchParams.get("industry") ?? "";

  const [posts, setPosts]     = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (industry: string, pg: number, replace: boolean) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pg) });
    if (industry) params.set("industry", industry);
    const res  = await fetch(`/api/forum?${params}`).catch(() => null);
    const data: ForumPost[] = res?.ok ? await res.json() : [];
    setPosts(prev => replace ? data : [...prev, ...data]);
    setHasMore(data.length === 20);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(1);
    load(activeIndustry, 1, true);
  }, [activeIndustry, load]);

  function setIndustry(ind: string) {
    const params = new URLSearchParams();
    if (ind) params.set("industry", ind);
    router.push(`/forum${params.size ? `?${params}` : ""}`);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(activeIndustry, next, false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Community Forum</h1>
              <p className="mt-1 text-brand-300 text-sm">
                Ask questions, share advice, connect with Neopolis residents
              </p>
            </div>
            <Link
              href="/forum/new"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus size={16} /> Ask a Question
            </Link>
          </div>

          {/* Industry filter pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setIndustry("")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                !activeIndustry
                  ? "bg-white text-brand-900 border-white"
                  : "border-brand-700 text-brand-300 hover:border-white hover:text-white"
              }`}
            >
              All Topics
            </button>
            {industries.map(ind => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                  activeIndustry === ind
                    ? "bg-white text-brand-900 border-white"
                    : "border-brand-700 text-brand-300 hover:border-white hover:text-white"
                }`}
              >
                {INDUSTRY_EMOJI[ind] ?? "📌"} {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && posts.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-gray-600">No posts yet</p>
            <p className="text-sm mt-1">Be the first to ask a question!</p>
            <Link href="/forum/new" className="mt-4 inline-block text-brand-600 font-semibold hover:underline text-sm">
              Start a thread →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-brand-600 hover:text-brand-800 disabled:opacity-50"
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: ForumPost }) {
  return (
    <Link href={`/forum/${post.id}`} className="block group">
      <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm uppercase">
            {post.author_name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug line-clamp-2">
              {post.title}
            </h2>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.body}</p>

            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              {post.industry && (
                <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {INDUSTRY_EMOJI[post.industry] ?? "📌"} {post.industry}
                  {post.type && <><ChevronRight size={10} className="opacity-50" />{post.type}</>}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} /> {timeAgo(post.created_at)}
              </span>
              <span className="text-xs text-gray-400">by {post.author_name}</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-gray-500 font-semibold">
                <MessageSquare size={12} /> {post.reply_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
