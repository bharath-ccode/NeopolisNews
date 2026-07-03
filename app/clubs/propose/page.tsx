"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, AtSign, LogIn, CheckCircle2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CLUB_CATEGORIES } from "@/lib/clubs";

const EMOJI_CHOICES = ["🏃", "🚴", "🏸", "🧘", "🌳", "🧹", "🐕", "📚", "📷", "🎵", "🎨", "🍳", "👨‍👩‍👧", "♟️", "🌟"];

export default function ProposeClubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName]         = useState("");
  const [category, setCategory] = useState<string>("");
  const [emoji, setEmoji]       = useState("🌟");
  const [description, setDescription] = useState("");
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim())     { setError("Please name your club."); return; }
    if (!category)        { setError("Please pick a category."); return; }
    if (!description.trim()) { setError("Tell us what the club will do."); return; }
    setSending(true);
    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id:     user!.id,
        lead_name:   user!.screen_name,
        name:        name.trim(),
        category,
        emoji,
        description: description.trim(),
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to submit proposal.");
      setSending(false);
      return;
    }
    setDone(true);
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link href="/clubs" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Clubs
          </Link>
          <h1 className="text-2xl font-extrabold mt-5">Propose a Club</h1>
          <p className="text-gray-400 text-sm mt-1">
            You&apos;ll be the club lead — hosting events, marking attendance, growing the community.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {authLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : !user ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <LogIn className="w-8 h-8 mx-auto text-brand-200 mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Sign in to propose a club</p>
            <Link
              href="/auth/login?next=/clubs/propose"
              className="inline-block mt-3 bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : !user.screen_name ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <AtSign className="w-8 h-8 mx-auto text-amber-400 mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Choose a screen name first</p>
            <p className="text-sm text-gray-400 mb-4">
              Club leads are known by their screen name.
            </p>
            <Link
              href="/dashboard/individual/profile"
              className="inline-block bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Set screen name →
            </Link>
          </div>
        ) : done ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <h2 className="font-extrabold text-gray-900 text-lg mb-1">Proposal submitted!</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
              The NeopolisNews team reviews every club to keep the directory small and alive.
              Once approved, you&apos;ll be the lead of <strong>{name}</strong> and can start hosting events.
            </p>
            <button onClick={() => router.push("/clubs")} className="btn-primary text-sm">
              Back to Clubs
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold">
              <Users className="w-3.5 h-3.5" />
              Proposing as @{user.screen_name} — you&apos;ll lead this club
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Club name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="e.g. Neopolis Runners"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CLUB_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      category === c.id
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-brand-300"
                    }`}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Club emoji</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_CHOICES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-colors ${
                      emoji === e ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-300"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                What will the club do? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="What activities, how often, who's it for? e.g. Weekend 5K runs every Saturday 6 AM, monthly community race, all levels welcome."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Send className="w-3.5 h-3.5" /> {sending ? "Submitting…" : "Submit Proposal"}
            </button>
            <p className="text-xs text-gray-400">
              We keep the club list deliberately small — one strong club per activity beats five
              quiet ones. Proposals are reviewed by the NeopolisNews team.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
