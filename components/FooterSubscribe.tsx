"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/digest/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
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
      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
        <CheckCircle className="w-4 h-4 shrink-0" />
        You&apos;re subscribed! See you Monday.
      </div>
    );
  }

  return (
    <div>
      <p className="text-white text-sm font-semibold mb-1">Weekly Digest</p>
      <p className="text-brand-300 text-xs mb-3">
        Top news, events &amp; listings every Monday.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-brand-900 border border-brand-700 rounded-lg px-3 py-2">
          <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-transparent text-white placeholder-brand-500 text-xs outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-60 shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Subscribe"}
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
