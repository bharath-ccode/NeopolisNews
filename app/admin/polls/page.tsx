"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Loader2, Eye, EyeOff, Trash2, Plus, X } from "lucide-react";
import clsx from "clsx";

interface PollOption {
  id: string;
  label: string;
}

interface Poll {
  id: string;
  question: string;
  publish_date: string;
  status: "draft" | "published";
  created_at: string;
  options: PollOption[];
}

interface OptionDraft {
  label: string;
  seedVotes: string;
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function emptyOption(): OptionDraft {
  return { label: "", seedVotes: "" };
}

export default function AdminPollsPage() {
  const [polls, setPolls]     = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [question, setQuestion] = useState("");
  const [publishDate, setPublishDate] = useState(todayIso());
  const [options, setOptions] = useState<OptionDraft[]>([emptyOption(), emptyOption()]);
  const [saving, setSaving]   = useState(false);

  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/polls").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setPolls(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateOption(i: number, patch: Partial<OptionDraft>) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }
  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, emptyOption()]);
  }
  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save(publish: boolean) {
    setError("");
    if (!question.trim()) { setError("Question is required."); return; }
    const cleanOptions = options
      .filter((o) => o.label.trim())
      .map((o) => ({ label: o.label.trim(), seedVotes: Math.max(0, parseInt(o.seedVotes, 10) || 0) }));
    if (cleanOptions.length < 2) { setError("At least 2 options are required."); return; }
    if (!publishDate) { setError("Publish date is required."); return; }

    setSaving(true);
    const res = await fetch("/api/admin/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question.trim(),
        publish_date: publishDate,
        options: cleanOptions,
        status: publish ? "published" : "draft",
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to save.");
      setSaving(false);
      return;
    }
    setQuestion("");
    setOptions([emptyOption(), emptyOption()]);
    setPublishDate(todayIso());
    setSaving(false);
    load();
  }

  async function setStatus(id: string, status: "published" | "draft") {
    setActing(id);
    const res = await fetch(`/api/admin/polls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    if (res?.ok) load();
    setActing(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this poll and all its votes?")) return;
    setActing(id);
    const res = await fetch(`/api/admin/polls/${id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) load();
    setActing(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-500" /> Homepage Poll
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          One question, multiple choice — anyone can vote, no sign-in required. Live results shown after voting.
        </p>
      </div>

      {/* Create form */}
      <div className="card p-5 space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
            placeholder="e.g. What should Neopolis prioritize next?"
            className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Options</label>
          <p className="text-[11px] text-gray-400 mt-0.5 mb-1.5">
            Seed votes (optional) give an option a starting count — real votes add on top.
          </p>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateOption(i, { label: e.target.value })}
                  maxLength={100}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <input
                  type="number"
                  min={0}
                  value={opt.seedVotes}
                  onChange={(e) => updateOption(i, { seedVotes: e.target.value })}
                  placeholder="Seed votes"
                  className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="shrink-0 text-gray-400 hover:text-red-500 px-2"
                    title="Remove option"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
            >
              <Plus className="w-3.5 h-3.5" /> Add option
            </button>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Publish date</label>
          <input
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <p className="text-[11px] text-gray-400 mt-1">One poll per date — saving replaces any poll already on that date.</p>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="btn-primary text-sm py-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Publish
          </button>
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="text-sm font-bold text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
          >
            Save as draft
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : polls.length === 0 ? (
        <div className="card p-12 text-center">
          <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">No polls yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {polls.map((p) => (
            <div key={p.id} className="card p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-gray-900 text-sm">{p.question}</p>
                  <span
                    className={clsx(
                      "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                      p.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(p.publish_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{p.options.map((o) => o.label).join(" · ")}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setStatus(p.id, p.status === "published" ? "draft" : "published")}
                  disabled={acting === p.id}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-brand-600"
                  title={p.status === "published" ? "Unpublish" : "Publish"}
                >
                  {p.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => remove(p.id)}
                  disabled={acting === p.id}
                  className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
