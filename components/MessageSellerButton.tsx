"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2, Send, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";

/** "Message seller" button + inline composer for a classified listing. */
export default function MessageSellerButton({ classifiedId }: { classifiedId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [body, setBody]       = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  function start(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setOpen(true);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!body.trim()) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({
        classified_id: classifiedId,
        sender_name: user!.screen_name ?? user!.name,
        body: body.trim(),
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to send.");
      setSending(false);
      return;
    }
    setSent(true);
    setSending(false);
  }

  if (sent) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); router.push("/dashboard/individual/messages"); }}
        className="w-full text-xs font-bold text-green-700 bg-green-50 rounded-lg px-3 py-2 hover:bg-green-100 transition-colors"
      >
        ✓ Sent — view conversation
      </button>
    );
  }

  if (!open) {
    return (
      <button
        onClick={start}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-brand-600 border border-brand-200 rounded-lg px-3 py-2 hover:bg-brand-50 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" /> Message seller
      </button>
    );
  }

  return (
    <form onSubmit={send} className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start gap-1.5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={2000}
          autoFocus
          placeholder="Hi, is this still available?"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        <button type="button" onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500 mt-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={sending || !body.trim()}
        className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
      >
        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        Send
      </button>
    </form>
  );
}
