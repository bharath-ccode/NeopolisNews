"use client";

import { useEffect, useState } from "react";
import { BellRing, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";

/** "Email me new listings like this" box — saves the current filter set as an alert. */
export default function SaveSearchAlert({
  subCategory,
  listingType,
  bedrooms,
}: {
  subCategory?: string; // undefined = any
  listingType?: string;
  bedrooms?: string;
}) {
  const { user } = useAuth();
  const [email, setEmail]     = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const summary = [
    bedrooms && bedrooms !== "all" ? `${bedrooms} BHK` : null,
    subCategory && subCategory !== "all" ? subCategory : null,
    listingType && listingType !== "all" ? `for ${listingType}` : null,
  ].filter(Boolean).join(" ") || "any new listing";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setSending(true);
    setError("");
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({
        email:        email.trim(),
        sub_category: subCategory !== "all" ? subCategory : undefined,
        listing_type: listingType !== "all" ? listingType : undefined,
        bedrooms:     bedrooms !== "all" ? bedrooms : undefined,
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to save alert.");
      setSending(false);
      return;
    }
    setDone(true);
    setSending(false);
  }

  if (done) {
    return (
      <div className="card p-4 flex items-center gap-3 bg-green-50 border-green-200">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-800">
          Alert saved — we&apos;ll email you when a matching listing goes live. Manage alerts in your{" "}
          <a href="/dashboard/individual/saved" className="font-semibold underline">dashboard</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <BellRing className="w-4 h-4 text-brand-500 shrink-0" />
          Email me when <span className="text-brand-700 capitalize">{summary}</span> is posted
        </p>
        <div className="flex gap-2 flex-1 min-w-[240px]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            type="submit"
            disabled={sending}
            className="btn-primary text-xs py-2 disabled:opacity-60 shrink-0"
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Set Alert"}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
