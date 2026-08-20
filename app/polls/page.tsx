"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart2, Loader2, Clock } from "lucide-react";
import PollPanel, { type PollResult } from "@/components/PollPanel";

interface ArchiveEntry {
  id: string;
  question: string;
  publish_date: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function PollsPage() {
  const [latest, setLatest]   = useState<PollResult | null>(null);
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [selected, setSelected] = useState<PollResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPoll, setLoadingPoll] = useState(false);

  const poll = selected ?? latest;

  const load = useCallback(async () => {
    const res = await fetch("/api/polls").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setLatest(data.latest);
      setArchive(data.archive ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openArchived(id: string) {
    setLoadingPoll(true);
    const res = await fetch(`/api/polls/${id}`).catch(() => null);
    if (res?.ok) {
      setSelected(await res.json());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setLoadingPoll(false);
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
            <BarChart2 className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-extrabold">Neopolis Poll</h1>
          <p className="text-gray-400 mt-1">Vote on the question of the day, see how the city is leaning.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {!poll ? (
          <div className="card p-12 text-center">
            <BarChart2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 text-sm">The first poll is on its way</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {fmtDate(poll.publish_date)}
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
              <div className="px-6 pb-6">
                {loadingPoll ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                  </div>
                ) : (
                  <PollPanel poll={poll} onUpdate={(p) => (selected ? setSelected(p) : setLatest(p))} />
                )}
              </div>
            </div>

            {archive.length > 1 && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">From the Archive</h3>
                <div className="space-y-2">
                  {archive
                    .filter((a) => a.id !== poll.id)
                    .map((a) => (
                      <button
                        key={a.id}
                        onClick={() => openArchived(a.id)}
                        className="card w-full text-left p-4 hover:shadow-md transition-shadow group"
                      >
                        <p className="text-sm font-bold text-gray-800 group-hover:text-brand-700 transition-colors">{a.question}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(a.publish_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
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
