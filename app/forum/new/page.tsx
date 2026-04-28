"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getIndustries, getTypes } from "@/lib/businessDirectory";

export default function NewForumPostPage() {
  const { user }    = useAuth();
  const router      = useRouter();
  const industries  = getIndustries();

  const [title,      setTitle]      = useState("");
  const [body,       setBody]       = useState("");
  const [authorName, setAuthorName] = useState(user?.name ?? "");
  const [industry,   setIndustry]   = useState("");
  const [type,       setType]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const types = industry ? getTypes(industry) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !authorName.trim()) {
      setError("Please fill in your name, title, and question.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/forum", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        author_name: authorName.trim(),
        title:       title.trim(),
        body:        body.trim(),
        industry:    industry || null,
        type:        type || null,
        user_id:     user?.id ?? null,
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

          {/* Author name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="e.g. Priya S."
              maxLength={60}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
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
          Be respectful. Posts are visible to all Neopolis residents.
        </p>
      </div>
    </div>
  );
}
