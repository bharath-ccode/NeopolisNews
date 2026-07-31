"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProjectSubscribeBox({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    const res = await fetch("/api/project-subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, email: email.trim(), user_id: user?.id }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Subscription failed. Please try again.");
      setSending(false);
      return;
    }
    setDone(true);
    setSending(false);
  }

  if (done) {
    return (
      <div className="bg-brand-900/60 border border-brand-700 rounded-2xl p-5 flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
        <p className="text-sm text-brand-100">
          You&apos;re subscribed! We&apos;ll email you every time {projectName} posts a construction update.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-brand-900/60 border border-brand-700 rounded-2xl p-5">
      <p className="font-bold text-white text-sm mb-1 flex items-center gap-2">
        <Bell className="w-4 h-4 text-brand-300" /> Follow this project&apos;s construction
      </p>
      <p className="text-xs text-brand-300 mb-3">
        Get an email whenever {projectName} publishes a construction milestone.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 bg-brand-950 border border-brand-700 text-white placeholder-brand-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
          Subscribe
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
