"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Loader2, Sparkles, Trophy, HeartHandshake, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { CLUB_CATEGORIES } from "@/lib/clubs";

interface Club {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  lead_name: string;
  member_count: number;
}

const CATEGORY_LABELS = Object.fromEntries(CLUB_CATEGORIES.map((c) => [c.id, c.label]));

export default function ClubsPage() {
  const [clubs, setClubs]     = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    const qs = category !== "all" ? `?category=${category}` : "";
    fetch(`/api/clubs${qs}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClubs(data); })
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="tag-purple mb-4 inline-block">Community Clubs</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-3">
            Do things together.<br />
            <span className="text-brand-400">Earn points for showing up.</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Neopolis clubs host real events — runs, plantation drives, cleanups,
            hobby meetups. Members get event fee waivers, and attending earns you
            Neopolis Points.
          </p>
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <Link href="/leaderboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Trophy className="w-4 h-4 text-yellow-400" /> Points for attending — see the leaderboard →
            </Link>
            <span className="flex items-center gap-2 text-gray-300">
              <Sparkles className="w-4 h-4 text-brand-400" /> Member fee waivers
            </span>
            <span className="flex items-center gap-2 text-gray-300">
              <HeartHandshake className="w-4 h-4 text-green-400" /> Civic impact counts extra
            </span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-bold transition-colors",
              category === "all"
                ? "bg-brand-600 text-white"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            )}
          >
            All
          </button>
          {CLUB_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-sm font-bold transition-colors",
                category === c.id
                  ? "bg-brand-600 text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : clubs.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 text-sm">No clubs here yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Be the one who starts it — propose a club and lead it.
            </p>
            <Link href="/clubs/propose" className="btn-primary text-xs py-2 inline-flex">
              Propose a Club
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="card p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl shrink-0">
                    {club.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
                      {club.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {CATEGORY_LABELS[club.category] ?? club.category} · led by @{club.lead_name}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 shrink-0 mt-1" />
                </div>
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{club.description}</p>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-3">
                  <Users className="w-3.5 h-3.5" />
                  {club.member_count} {club.member_count === 1 ? "member" : "members"}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Propose CTA */}
        {!loading && clubs.length > 0 && (
          <div className="mt-8 card p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900 text-sm">Missing a club you&apos;d join?</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Propose it and lead it — we keep the list small so every club stays alive.
              </p>
            </div>
            <Link href="/clubs/propose" className="btn-primary text-xs py-2">
              Propose a Club
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
