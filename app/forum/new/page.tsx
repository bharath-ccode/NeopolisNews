"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, AtSign, BarChart3, Plus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getIndustries, getTypes } from "@/lib/businessDirectory";

export default function NewForumPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router      = useRouter();
  const industries  = getIndustries();

  const [title,      setTitle]      = useState("");
  const [body,       setBody]       = useState("");
  const [industry,   setIndustry]   = useState("");
  const [type,       setType]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [showPoll,   setShowPoll]   = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login?next=/forum/new");
    }
  }, [authLoading, user, router]);

  const types = industry ? getTypes(industry) : [];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!user.screen_name) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-brand-950 text-white px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Link href="/forum" className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm font-medium mb-4 transition-colors">
              <ArrowLeft size={15} /> Back to Forum
            </Link>
            <h1 className="text-2xl font-extrabold">Ask the Community</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
              <AtSign className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">Choose a screen name first</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Before posting, pick a screen name so the community can know you — without revealing your real identity.
            </p>
            <Link
              href="/dashboard/individual/profile"
              className="inline-block mt-2 bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Set screen name in Profile →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please fill in the title and your question.");
      return;
    }
    const filledOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (showPoll && filledOptions.length < 2) {
      setError("A poll needs at least 2 options — or remove the poll.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/forum", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        author_name: user?.screen_name ?? "",
        title:       title.trim(),
        body:        body.trim(),
        industry:    industry || null,
        type:        type || null,
        user_id:     user!.id,
        ...(showPoll && filledOptions.length >= 2 ? { poll_options: filledOptions } : {}),
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError((j as { error?: string }).error ?? "Failed to post. Please try again.");
      setSubmitting(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/forum/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-950 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/forum" className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft size={15} /> Back to Forum
          </Link>
          <h1 className="text-2xl font-extrabold">Ask the Community</h1>
          <p className="text-brand-300 text-sm mt-1">
            Neighbours will respond — be as specific as possible.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Posting as */}
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs uppercase">
              {user.screen_name!.charAt(0)}
            </div>
            Posting as <span className="font-semibold text-gray-800">@{user.screen_name}</span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Question / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Best IB schools near Neopolis for 3rd grade?"
              maxLength={200}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Details <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Share context — timeline, specific needs, what you've already tried…"
              maxLength={2000}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{body.length}/2000</p>
          </div>

          {/* Poll — optional */}
          <div className="border-t border-gray-100 pt-5">
            {!showPoll ? (
              <button
                type="button"
                onClick={() => setShowPoll(true)}
                className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
              >
                <BarChart3 size={15} /> Add a poll
                <span className="text-gray-400 font-normal">(let neighbours vote)</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BarChart3 size={15} className="text-brand-500" /> Poll options
                  </p>
                  <button
                    type="button"
                    onClick={() => { setShowPoll(false); setPollOptions(["", ""]); }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-semibold"
                  >
                    <X size={12} /> Remove poll
                  </button>
                </div>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) =>
                        setPollOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))
                      }
                      maxLength={80}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions((prev) => prev.filter((_, j) => j !== i))}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions((prev) => [...prev, ""])}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    <Plus size={13} /> Add option
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Category — optional */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Category <span className="text-gray-400 font-normal">(optional — helps others find your post)</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Industry */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 mb-1">Industry</label>
                <div className="relative">
                  <select
                    value={industry}
                    onChange={e => { setIndustry(e.target.value); setType(""); }}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                  >
                    <option value="">— Select —</option>
                    {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Type */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    disabled={!industry}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">— Select —</option>
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {industry && (
              <p className="text-xs text-brand-600 mt-2">
                Tagged: <strong>{industry}</strong>{type && <> › <strong>{type}</strong></>}
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {submitting ? "Posting…" : "Post Question"}
            </button>
            <Link href="/forum" className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Be respectful. Posts are visible to all Neopolis residents. Not you?{" "}
          <button onClick={() => router.push("/auth/login?next=/forum/new")} className="text-brand-500 hover:underline">Switch account</button>
        </p>
      </div>
    </div>
  );
}
