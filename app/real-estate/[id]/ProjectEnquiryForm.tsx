"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";

export default function ProjectEnquiryForm({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [form, setForm] = useState({ senderName: "", senderPhone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const INPUT =
    "w-full bg-brand-900 border border-brand-700 text-white placeholder-brand-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/enquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <CheckCircle className="w-10 h-10 text-green-400" />
        <p className="font-bold text-white text-lg">Enquiry sent!</p>
        <p className="text-brand-300 text-sm">
          The {projectName} team will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-white font-bold text-base mb-1">Send an Enquiry</p>
      <p className="text-brand-300 text-sm mb-4">
        Interested in a unit? We&apos;ll get back to you within 24 hours.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className={INPUT}
          placeholder="Your name *"
          value={form.senderName}
          onChange={(e) => setForm({ ...form, senderName: e.target.value })}
          required
        />
        <input
          className={INPUT}
          placeholder="Mobile number *"
          type="tel"
          value={form.senderPhone}
          onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
          required
        />
        <textarea
          className={INPUT}
          placeholder="Message — e.g. BHK preference, budget, timeline…"
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? "Sending…" : "Send Enquiry"}
        </button>
      </form>
    </div>
  );
}
