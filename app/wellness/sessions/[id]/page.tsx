"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Users, IndianRupee, Video,
  Loader2, CheckCircle, ExternalLink, LogIn,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { detectProvider } from "@/lib/videoProviders";

interface Session {
  id: string;
  trainer_name: string;
  session_type: string;
  language: string;
  description: string | null;
  price_inr: number;
  max_seats: number;
  seats_taken: number;
  platform: string;
  platform_label: string;
  start_date: string;
  end_date: string;
  status: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [fetchingLink, setFetchingLink] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [sessionRes, authRes] = await Promise.all([
        fetch(`/api/wellness-sessions/${id}`),
        supabase.auth.getSession(),
      ]);

      const sessionData = await sessionRes.json().catch(() => null);
      setSession(sessionData?.id ? sessionData : null);

      const s = authRes.data.session;
      if (s) {
        setUserId(s.user.id);
        setToken(s.access_token);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJoinLink = useCallback(async (t: string) => {
    setFetchingLink(true);
    const res = await fetch(`/api/wellness-sessions/${id}/join`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMeetingLink(data.meeting_link);
      setEnrolled(true);
    }
    setFetchingLink(false);
  }, [id]);

  useEffect(() => {
    if (token) fetchJoinLink(token);
  }, [token, fetchJoinLink]);

  async function handleEnroll() {
    if (!token || !session) return;
    setPaying(true);
    setError("");

    const loaded = await loadRazorpay();
    if (!loaded) { setError("Could not load payment gateway. Please try again."); setPaying(false); return; }

    const res = await fetch(`/api/wellness-sessions/${id}/enroll`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Enrollment failed."); setPaying(false); return; }

    const options = {
      key: data.keyId,
      amount: data.amount * 100,
      currency: "INR",
      name: "NeopolisNews",
      description: `${session.session_type} with ${session.trainer_name}`,
      order_id: data.orderId,
      handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch(`/api/wellness-sessions/${id}/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(response),
        });
        if (verifyRes.ok) {
          setEnrolled(true);
          await fetchJoinLink(token);
          router.push("/dashboard/individual/sessions");
        } else {
          setError("Payment received but verification failed. Please contact support.");
        }
      },
      prefill: { name: "", email: "", contact: "" },
      theme: { color: "#6d28d9" },
      modal: { ondismiss: () => setPaying(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setPaying(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Session not found.</p>
          <Link href="/health/wellness" className="btn-primary text-sm">Back to Wellness</Link>
        </div>
      </div>
    );
  }

  const provider = detectProvider("");
  const providerInfo = {
    ...provider,
    label: session.platform_label,
    color: (() => {
      const map: Record<string, string> = {
        zoom: "bg-blue-50 text-blue-700 border-blue-200",
        meet: "bg-green-50 text-green-700 border-green-200",
        teams: "bg-indigo-50 text-indigo-700 border-indigo-200",
        webex: "bg-red-50 text-red-700 border-red-200",
      };
      return map[session.platform] ?? "bg-gray-50 text-gray-700 border-gray-200";
    })(),
    note: (() => {
      const map: Record<string, string> = {
        zoom: "You'll need a free Zoom account to join.",
        meet: "You'll need a Google account to join.",
        teams: "You'll need a Microsoft account to join.",
        webex: "You can join Webex as a guest — no account needed.",
        youtube: "Watch live on YouTube — no account needed.",
      };
      return map[session.platform] ?? "You'll receive joining instructions after enrollment.";
    })(),
  };

  const seatsLeft = session.max_seats - session.seats_taken;
  const isFull = seatsLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/health/wellness?type=trainer" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Wellness
        </Link>

        <div className="card p-6 space-y-5">
          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">{session.session_type}</span>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{session.language}</span>
              {session.status === "live" && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">{session.session_type} with {session.trainer_name}</h1>
            {session.description && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{session.description}</p>
            )}
          </div>

          {/* Details */}
          <div className="grid sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Duration</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(session.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                  {new Date(session.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Monthly fee</p>
                <p className="text-sm font-extrabold text-gray-900">₹{session.price_inr.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Seats</p>
                <p className="text-sm font-semibold text-gray-900">
                  {seatsLeft > 0 ? `${seatsLeft} of ${session.max_seats} left` : "Fully booked"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                <Video className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Platform</p>
                <p className="text-sm font-semibold text-gray-900">{session.platform_label}</p>
              </div>
            </div>
          </div>

          {/* Platform note */}
          <div className={`flex items-start gap-2.5 text-xs font-medium px-4 py-3 rounded-xl border ${providerInfo.color}`}>
            <Video className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>This session is on {providerInfo.label}.</strong> {providerInfo.note}</span>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
          )}

          {/* CTA */}
          {enrolled && meetingLink ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                <CheckCircle className="w-5 h-5 text-green-600" /> You&apos;re enrolled!
              </div>
              <a
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" /> Join on {session.platform_label}
              </a>
              <Link href="/dashboard/individual/sessions" className="block text-center text-xs text-brand-600 hover:underline">
                View all my sessions
              </Link>
            </div>
          ) : enrolled && fetchingLink ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your meeting link…
            </div>
          ) : !userId ? (
            <Link
              href={`/auth/login?redirect=/wellness/sessions/${id}`}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" /> Login to Enroll
            </Link>
          ) : isFull ? (
            <div className="text-center text-sm text-gray-500 py-3 font-semibold">This session is fully booked.</div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={paying}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
              {paying ? "Opening payment…" : `Enroll & Pay ₹${session.price_inr.toLocaleString("en-IN")}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
