"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe, Flag, MapPin, Building2, ArrowLeft, Sparkles, Clock,
  ChevronLeft, ChevronRight, PenLine, CalendarDays,
} from "lucide-react";
import { DIGEST_LEVELS, LEVEL_LABELS, type DigestLevel, type StoryLevel } from "@/lib/digestSources";

interface DigestArticle {
  id: string;
  title: string;
  excerpt: string;
  read_time: string;
  digest_level: StoryLevel;
  digest_date: string;
}

const LEVEL_ICONS: Record<DigestLevel, React.ElementType> = {
  international: Globe,
  national:      Flag,
  state:         MapPin,
  city:          Building2,
};

const LEVEL_COLORS: Record<DigestLevel, { badge: string; border: string }> = {
  international: { badge: "bg-purple-100 text-purple-700",   border: "border-l-purple-400"  },
  national:      { badge: "bg-blue-100 text-blue-700",       border: "border-l-blue-400"    },
  state:         { badge: "bg-emerald-100 text-emerald-700", border: "border-l-emerald-400" },
  city:          { badge: "bg-orange-100 text-orange-700",   border: "border-l-orange-400"  },
};

function getTodayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

function formatChip(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", timeZone: "UTC",
  });
}

export default function TodaysNewsPage() {
  const today = getTodayIST();
  const [selectedDate, setSelectedDate] = useState(today);
  const [articles, setArticles] = useState<DigestArticle[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news-digest?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setDates(data.dates ?? []);
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const isToday = selectedDate === today;
  const publishedLevels = new Set(articles.map((a) => a.digest_level));
  const editorStories = articles.filter((a) => a.digest_level === "editor");

  // Prev/next navigation across dates that actually have a digest
  const dateIdx = dates.indexOf(selectedDate);
  const olderDate = dateIdx >= 0 ? dates[dateIdx + 1] : dates.find((d) => d < selectedDate);
  const newerDate = dateIdx > 0 ? dates[dateIdx - 1] : undefined;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> All News
          </Link>
          <div className="mt-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span className="text-brand-300 text-sm font-semibold tracking-wide uppercase">AI Daily Digest</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 leading-snug">
            {isToday ? "Today's News" : "News Digest"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{formatDate(selectedDate)}</p>
          <p className="text-gray-300 text-sm mt-3 max-w-xl">
            One curated article per level — international, national, state, and city — written for Hyderabad&apos;s business and IT community.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Date navigation ── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => olderDate && setSelectedDate(olderDate)}
            disabled={!olderDate}
            className="shrink-0 p-2 rounded-full border border-gray-200 text-gray-400 hover:text-brand-600 hover:border-brand-300 disabled:opacity-30 transition-colors"
            aria-label="Older digest"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {dates.slice(0, 14).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                d === selectedDate
                  ? "bg-brand-600 text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {d === today ? "Today" : formatChip(d)}
            </button>
          ))}

          <button
            onClick={() => newerDate && setSelectedDate(newerDate)}
            disabled={!newerDate}
            className="shrink-0 p-2 rounded-full border border-gray-200 text-gray-400 hover:text-brand-600 hover:border-brand-300 disabled:opacity-30 transition-colors"
            aria-label="Newer digest"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">Loading digest…</div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-16">
            <CalendarDays className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            {isToday ? (
              <>
                <p className="text-gray-500 font-medium">Today&apos;s digest isn&apos;t ready yet</p>
                <p className="text-sm text-gray-400 mt-1">Check back after 5 AM IST — articles are published once the editorial team approves them.</p>
              </>
            ) : (
              <p className="text-gray-500 font-medium">No digest was published on this day.</p>
            )}
            {!isToday && dates.length > 0 && (
              <button onClick={() => setSelectedDate(dates[0])} className="text-brand-600 text-sm font-semibold mt-3 hover:underline">
                Go to the latest digest →
              </button>
            )}
          </div>
        )}

        {/* ── The four levels ── */}
        {!loading && articles.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {DIGEST_LEVELS.map((level) => {
              if (!publishedLevels.has(level)) return null;
              const article = articles.find((a) => a.digest_level === level)!;
              const Icon = LEVEL_ICONS[level];
              const colors = LEVEL_COLORS[level];

              return (
                <Link
                  key={level}
                  href={`/news/${article.id}`}
                  className={`card border-l-4 ${colors.border} p-5 block hover:shadow-md transition-shadow group`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {LEVEL_LABELS[level]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                      <Clock className="w-3 h-3" /> {article.read_time}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-base leading-snug group-hover:text-brand-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-3">{article.excerpt}</p>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Editor's Desk stories for this date ── */}
        {!loading && editorStories.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PenLine className="w-4 h-4 text-amber-500" /> From the Editor&apos;s Desk
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {editorStories.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="card border-l-4 border-l-amber-400 p-5 block hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      <PenLine className="w-3.5 h-3.5" /> Editor&apos;s Desk
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                      <Clock className="w-3 h-3" /> {article.read_time}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-base leading-snug group-hover:text-brand-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-3">{article.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <p className="text-xs text-gray-400 text-center pt-8">
            Generated by AI · Edited and approved by NeopolisNews editorial team
          </p>
        )}
      </div>
    </div>
  );
}
