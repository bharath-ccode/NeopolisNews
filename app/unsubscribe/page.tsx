"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/digest/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-brand-600" />
        </div>

        {done ? (
          <>
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">You&apos;ve been unsubscribed</h1>
            <p className="text-gray-500 text-sm mb-6">
              You will no longer receive the NeopolisNews weekly digest.
            </p>
            <Link href="/" className="text-brand-600 text-sm hover:underline">
              Back to NeopolisNews
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Unsubscribe from Digest</h1>
            <p className="text-gray-500 text-sm mb-6">
              Enter your email to stop receiving the NeopolisNews weekly digest.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Processing…" : "Unsubscribe"}
              </button>
            </form>
            <Link href="/" className="block mt-4 text-gray-400 text-xs hover:text-gray-600">
              Keep me subscribed — go back
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
