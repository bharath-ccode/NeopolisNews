"use client";

import { useState } from "react";
import { Ticket, CheckCircle, Loader2, LogIn, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  eventId: string;
  soldOut: boolean;
  isFree: boolean;
}

const INPUT =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 " +
  "focus:outline-none focus:ring-2 focus:ring-violet-400";

/** Free events claim a slot directly (claim_event_slot RPC — handles
 *  unlimited capacity when total_slots is null). Paid events have no
 *  payment integration yet, so instead of pretending to sell a ticket this
 *  collects contact details and passes them to the event's organiser, who
 *  follows up to take payment. */
export default function ClaimButton({ eventId, soldOut, isFree }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "claimed" | "full" | "error">("idle");
  const [needsLogin, setNeedsLogin] = useState(false);

  const [interestOpen, setInterestOpen] = useState(false);
  const [interestName, setInterestName] = useState("");
  const [interestPhone, setInterestPhone] = useState("");
  const [interestEmail, setInterestEmail] = useState("");
  const [interestSending, setInterestSending] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [interestError, setInterestError] = useState("");

  async function handleClaim() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setNeedsLogin(true); return; }

    setStatus("loading");
    const res = await fetch(`/api/events/${eventId}/claim`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      setStatus("claimed");
    } else if (res.status === 409) {
      setStatus("full");
    } else {
      setStatus("error");
    }
  }

  async function handleInterestSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInterestError("");
    if (!interestName.trim()) { setInterestError("Please enter your name."); return; }
    if (!/^[\d\s+\-()]{8,15}$/.test(interestPhone.trim())) { setInterestError("Please enter a valid phone number."); return; }
    if (interestEmail.trim() && !/^\S+@\S+\.\S+$/.test(interestEmail.trim())) { setInterestError("Please enter a valid email."); return; }

    setInterestSending(true);
    const res = await fetch(`/api/events/${eventId}/interest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderName: interestName.trim(),
        senderPhone: interestPhone.trim(),
        senderEmail: interestEmail.trim() || undefined,
      }),
    }).catch(() => null);

    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setInterestError((j as { error?: string }).error ?? "Failed to send. Please try again.");
      setInterestSending(false);
      return;
    }
    setInterestSent(true);
    setInterestSending(false);
  }

  if (status === "claimed") {
    return (
      <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
        <CheckCircle className="w-5 h-5" />
        Slot Claimed!
      </div>
    );
  }

  if (interestSent) {
    return (
      <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm text-center">
        <CheckCircle className="w-5 h-5 shrink-0" />
        Sent! The organiser will contact you to complete payment.
      </div>
    );
  }

  if (needsLogin) {
    return (
      <a
        href={`/auth/login?redirect=/events/${eventId}`}
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

  // Paid event, no payment integration yet — collect contact details instead.
  if (!isFree) {
    if (!interestOpen) {
      return (
        <button
          onClick={() => setInterestOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          <Mail className="w-4 h-4" />
          I&apos;m Interested
        </button>
      );
    }
    return (
      <form onSubmit={handleInterestSubmit} className="space-y-2.5">
        <p className="text-xs text-gray-400">
          We&apos;ll pass your details to the organiser to arrange payment.
        </p>
        <input
          className={INPUT} value={interestName} onChange={(e) => setInterestName(e.target.value)}
          placeholder="Your name *" maxLength={80}
        />
        <input
          type="tel" className={INPUT} value={interestPhone} onChange={(e) => setInterestPhone(e.target.value)}
          placeholder="Phone number *" maxLength={15}
        />
        <input
          type="email" className={INPUT} value={interestEmail} onChange={(e) => setInterestEmail(e.target.value)}
          placeholder="Email address (optional)" maxLength={120}
        />
        {interestError && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{interestError}</p>
        )}
        <button
          type="submit"
          disabled={interestSending}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          {interestSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Interest"}
        </button>
      </form>
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
