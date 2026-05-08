"use client";

import { useState } from "react";
import { Ticket, CheckCircle, Loader2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  eventId: string;
  soldOut: boolean;
  hasSlots: boolean;
}

export default function ClaimButton({ eventId, soldOut, hasSlots }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "claimed" | "full" | "error">("idle");
  const [needsLogin, setNeedsLogin] = useState(false);

  async function handleClaim() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setNeedsLogin(true); return; }

    setStatus("loading");
    const res = await fetch(`/api/events/${eventId}/claim`, { method: "POST" });
    if (res.ok) {
      setStatus("claimed");
    } else if (res.status === 409) {
      setStatus("full");
    } else {
      setStatus("error");
    }
  }

  if (status === "claimed") {
    return (
      <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
        <CheckCircle className="w-5 h-5" />
        Slot Claimed!
      </div>
    );
  }

  if (needsLogin) {
    return (
      <a
        href="/login"
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Sign in to Claim Slot
      </a>
    );
  }

  if (soldOut || status === "full") {
    return (
      <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold text-sm">
        Sold Out
      </div>
    );
  }

  if (!hasSlots) {
    return (
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors"
      >
        <Ticket className="w-4 h-4" />
        Register Interest
      </a>
    );
  }

  return (
    <button
      onClick={handleClaim}
      disabled={status === "loading"}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors"
    >
      {status === "loading" ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Claiming…</>
      ) : (
        <><Ticket className="w-4 h-4" /> Claim Slot</>
      )}
    </button>
  );
}
