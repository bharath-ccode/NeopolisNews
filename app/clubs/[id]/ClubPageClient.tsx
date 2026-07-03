"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Users, Loader2, CalendarDays, MapPin, Trophy, Megaphone,
  CheckCircle2, Plus, X, Send, Leaf, ClipboardCheck, IndianRupee, Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { authHeaders } from "@/lib/authToken";
import { CLUB_CATEGORIES } from "@/lib/clubs";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface Club {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  announcement: string | null;
  lead_name: string;
  member_count: number;
}
interface ClubEvent {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  event_date: string;
  start_time: string | null;
  fee_inr: number;
  member_fee_inr: number;
  max_participants: number | null;
  points_award: number;
  status: "upcoming" | "completed" | "cancelled";
  registered_count: number;
}
interface Member { member_name: string; role: string; }
interface ImpactEntry {
  id: string;
  title: string;
  detail: string | null;
  stat_label: string | null;
  stat_value: string | null;
  entry_date: string;
}
interface MyReg { event_id: string; payment_status: string; attended: boolean; }
interface Registrant {
  user_id: string;
  participant_name: string;
  is_member: boolean;
  payment_status: string;
  attended: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { Razorpay: any; }
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

const CATEGORY_LABELS = Object.fromEntries(CLUB_CATEGORIES.map((c) => [c.id, c.label]));

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function ClubPageClient() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [club, setClub]         = useState<Club | null>(null);
  const [events, setEvents]     = useState<ClubEvent[]>([]);
  const [members, setMembers]   = useState<Member[]>([]);
  const [impact, setImpact]     = useState<ImpactEntry[]>([]);
  const [myRole, setMyRole]     = useState<string | null>(null);
  const [myRegs, setMyRegs]     = useState<MyReg[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError]       = useState("");
  const [joining, setJoining]   = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);

  /* Lead console state */
  const [showEventForm, setShowEventForm]   = useState(false);
  const [showImpactForm, setShowImpactForm] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [attendanceFor, setAttendanceFor]   = useState<string | null>(null);
  const [registrants, setRegistrants]       = useState<Registrant[]>([]);
  const [checked, setChecked]               = useState<Set<string>>(new Set());
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [leadBusy, setLeadBusy]             = useState(false);

  /* New event form */
  const [evTitle, setEvTitle]   = useState("");
  const [evDesc, setEvDesc]     = useState("");
  const [evVenue, setEvVenue]   = useState("");
  const [evDate, setEvDate]     = useState("");
  const [evTime, setEvTime]     = useState("");
  const [evFee, setEvFee]       = useState("0");
  const [evMemberFee, setEvMemberFee] = useState("0");
  const [evMax, setEvMax]       = useState("");

  /* New impact form */
  const [imTitle, setImTitle]   = useState("");
  const [imDetail, setImDetail] = useState("");
  const [imStatLabel, setImStatLabel] = useState("");
  const [imStatValue, setImStatValue] = useState("");

  const isLead   = myRole === "lead";
  const isMember = myRole !== null;
  const isCivic  = club?.category === "civic_green";

  const load = useCallback(async () => {
    const res = await fetch(`/api/clubs/${id}`, { headers: await authHeaders() }).catch(() => null);
    if (!res?.ok) { setNotFound(true); setLoading(false); return; }
    const data = await res.json();
    setClub(data.club);
    setEvents(data.events);
    setMembers(data.members);
    setImpact(data.impact);
    setMyRole(data.my_role);
    setMyRegs(data.my_registrations);
    setAnnouncementDraft(data.club.announcement ?? "");
    setLoading(false);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  /* ── Join / leave ── */
  async function toggleJoin() {
    if (!user) { window.location.href = `/auth/login?next=/clubs/${id}`; return; }
    if (!user.screen_name) { window.location.href = "/dashboard/individual/profile"; return; }
    setJoining(true);
    setError("");
    const res = await fetch(`/api/clubs/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ member_name: user.screen_name }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Something went wrong.");
    } else {
      await load();
    }
    setJoining(false);
  }

  /* ── Event registration (free or Razorpay) ── */
  async function register(ev: ClubEvent) {
    if (!user) { window.location.href = `/auth/login?next=/clubs/${id}`; return; }
    if (!user.screen_name) { window.location.href = "/dashboard/individual/profile"; return; }
    setRegistering(ev.id);
    setError("");

    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) { setError("Session expired — please sign in again."); setRegistering(null); return; }

    const res = await fetch(`/api/club-events/${ev.id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ participant_name: user.screen_name }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      setError((data as { error?: string }).error ?? "Registration failed.");
      setRegistering(null);
      return;
    }

    if (data.registered) { await load(); setRegistering(null); return; }

    // Paid path — open Razorpay checkout
    const loaded = await loadRazorpay();
    if (!loaded) { setError("Could not load payment gateway."); setRegistering(null); return; }

    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amount * 100,
      currency: "INR",
      name: "NeopolisNews Clubs",
      description: data.eventTitle,
      order_id: data.orderId,
      handler: async (response: {
        razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string;
      }) => {
        const verifyRes = await fetch(`/api/club-events/${ev.id}/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(response),
        }).catch(() => null);
        if (!verifyRes?.ok) setError("Payment verification failed — contact support if you were charged.");
        await load();
      },
    });
    rzp.open();
    setRegistering(null);
  }

  /* ── Lead: create event ── */
  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setLeadBusy(true);
    setError("");
    const res = await fetch(`/api/clubs/${id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({
        title: evTitle,
        description: evDesc || undefined,
        venue: evVenue || undefined,
        event_date: evDate,
        start_time: evTime || undefined,
        fee_inr: Number(evFee) || 0,
        member_fee_inr: Number(evMemberFee) || 0,
        max_participants: evMax ? Number(evMax) : undefined,
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to create event.");
    } else {
      setShowEventForm(false);
      setEvTitle(""); setEvDesc(""); setEvVenue(""); setEvDate(""); setEvTime("");
      setEvFee("0"); setEvMemberFee("0"); setEvMax("");
      await load();
    }
    setLeadBusy(false);
  }

  /* ── Lead: impact entry ── */
  async function addImpact(e: React.FormEvent) {
    e.preventDefault();
    setLeadBusy(true);
    setError("");
    const res = await fetch(`/api/clubs/${id}/impact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({
        title: imTitle,
        detail: imDetail || undefined,
        stat_label: imStatLabel || undefined,
        stat_value: imStatValue || undefined,
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to add impact entry.");
    } else {
      setShowImpactForm(false);
      setImTitle(""); setImDetail(""); setImStatLabel(""); setImStatValue("");
      await load();
    }
    setLeadBusy(false);
  }

  /* ── Lead: announcement ── */
  async function saveAnnouncement() {
    setLeadBusy(true);
    await fetch(`/api/clubs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ announcement: announcementDraft }),
    }).catch(() => null);
    setEditAnnouncement(false);
    setLeadBusy(false);
    await load();
  }

  /* ── Lead: attendance ── */
  async function openAttendance(eventId: string) {
    setAttendanceFor(eventId);
    setRegistrants([]);
    const res = await fetch(`/api/club-events/${eventId}/attendance`, {
      headers: await authHeaders(),
    }).catch(() => null);
    if (res?.ok) {
      const data: Registrant[] = await res.json();
      setRegistrants(data);
      setChecked(new Set(data.filter((r) => r.attended).map((r) => r.user_id)));
    }
  }

  async function saveAttendance(eventId: string) {
    setSavingAttendance(true);
    const res = await fetch(`/api/club-events/${eventId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ attendee_user_ids: Array.from(checked) }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to save attendance.");
    } else {
      setAttendanceFor(null);
      await load();
    }
    setSavingAttendance(false);
  }

  /* ── Render ── */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-300" />
      </div>
    );
  }
  if (notFound || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Users size={40} className="opacity-30" />
        <p className="font-semibold">Club not found</p>
        <Link href="/clubs" className="text-brand-600 text-sm hover:underline">← All Clubs</Link>
      </div>
    );
  }

  const upcoming = events.filter((e) => e.status === "upcoming");
  const past     = events.filter((e) => e.status === "completed");
  const myRegFor = (eventId: string) => myRegs.find((r) => r.event_id === eventId);

  const INPUT = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/clubs" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Clubs
          </Link>
          <div className="flex items-start gap-4 mt-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-4xl shrink-0">
              {club.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold">{club.name}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {CATEGORY_LABELS[club.category] ?? club.category} · led by @{club.lead_name}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {club.member_count} members
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" /> {past.length} events hosted
                </span>
              </div>
            </div>
            <button
              onClick={toggleJoin}
              disabled={joining || isLead}
              className={`shrink-0 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 ${
                isMember
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-brand-600 hover:bg-brand-500 text-white"
              }`}
            >
              {joining ? "…" : isLead ? "Club Lead" : isMember ? "✓ Member" : "Join Club"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}

        {/* Announcement */}
        {(club.announcement || isLead) && (
          <div className="card p-5 border-l-4 border-l-brand-500">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" /> From the lead
              </p>
              {isLead && !editAnnouncement && (
                <button
                  onClick={() => setEditAnnouncement(true)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                >
                  Edit
                </button>
              )}
            </div>
            {editAnnouncement ? (
              <div className="space-y-2">
                <textarea
                  value={announcementDraft}
                  onChange={(e) => setAnnouncementDraft(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="e.g. Saturday run moves to 6:30 AM this week — meet at the clubhouse."
                  className={`${INPUT} resize-none`}
                />
                <div className="flex gap-2">
                  <button onClick={saveAnnouncement} disabled={leadBusy} className="btn-primary text-xs py-2 disabled:opacity-60">
                    Save
                  </button>
                  <button onClick={() => setEditAnnouncement(false)} className="text-xs font-semibold text-gray-500 px-3">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {club.announcement ?? <span className="text-gray-400 italic">No announcement yet.</span>}
              </p>
            )}
          </div>
        )}

        {/* About */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-2">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{club.description}</p>
          {!isMember && (
            <p className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2 mt-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Members get event fee waivers — and attending any event earns Neopolis Points.
            </p>
          )}
        </div>

        {/* Upcoming events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Upcoming Events</h2>
            {isLead && (
              <button
                onClick={() => setShowEventForm((s) => !s)}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                {showEventForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> New Event</>}
              </button>
            )}
          </div>

          {/* Lead: create event form */}
          {isLead && showEventForm && (
            <form onSubmit={createEvent} className="card p-5 mb-4 space-y-3">
              <input type="text" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} maxLength={100}
                placeholder="Event title * — e.g. Sunday 5K Community Run" className={INPUT} />
              <textarea value={evDesc} onChange={(e) => setEvDesc(e.target.value)} rows={2} maxLength={1000}
                placeholder="Details (optional)" className={`${INPUT} resize-none`} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={evDate} min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEvDate(e.target.value)} className={INPUT} />
                <input type="text" value={evTime} onChange={(e) => setEvTime(e.target.value)} maxLength={20}
                  placeholder="Start time — e.g. 6:30 AM" className={INPUT} />
              </div>
              <input type="text" value={evVenue} onChange={(e) => setEvVenue(e.target.value)} maxLength={120}
                placeholder="Venue — e.g. Clubhouse main gate" className={INPUT} />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fee (₹)</label>
                  <input type="number" min={0} value={evFee} onChange={(e) => setEvFee(e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Member fee (₹)</label>
                  <input type="number" min={0} value={evMemberFee} onChange={(e) => setEvMemberFee(e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Max spots</label>
                  <input type="number" min={1} value={evMax} onChange={(e) => setEvMax(e.target.value)}
                    placeholder="∞" className={INPUT} />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Member fee 0 = free for members. Attendees earn {isCivic ? 50 : 20} points
                ({isCivic ? "civic events earn extra" : "default for this category"}).
              </p>
              <button type="submit" disabled={leadBusy}
                className="flex items-center gap-2 btn-primary text-sm disabled:opacity-60">
                {leadBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Create Event
              </button>
            </form>
          )}

          {upcoming.length === 0 && !showEventForm ? (
            <div className="card p-8 text-center">
              <CalendarDays className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No upcoming events{isLead ? " — create one!" : " yet. Check back soon."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((ev) => {
                const reg = myRegFor(ev.id);
                const full = ev.max_participants !== null && ev.registered_count >= ev.max_participants;
                const myFee = isMember ? ev.member_fee_inr : ev.fee_inr;
                const waived = isMember && ev.fee_inr > 0 && ev.member_fee_inr === 0;
                return (
                  <div key={ev.id} className="card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{ev.title}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" /> {fmtDate(ev.event_date)}
                            {ev.start_time && ` · ${ev.start_time}`}
                          </span>
                          {ev.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {ev.venue}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-amber-600 font-semibold">
                            <Trophy className="w-3.5 h-3.5" /> {ev.points_award} pts
                          </span>
                        </div>
                        {ev.description && <p className="text-sm text-gray-500 mt-2">{ev.description}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                          {ev.fee_inr > 0 ? (
                            <span className="flex items-center gap-0.5 font-semibold text-gray-600">
                              <IndianRupee className="w-3 h-3" />{ev.fee_inr}
                              {ev.member_fee_inr === 0
                                ? <span className="text-green-600 ml-1">· FREE for members</span>
                                : ev.member_fee_inr < ev.fee_inr && (
                                    <span className="text-green-600 ml-1">· ₹{ev.member_fee_inr} for members</span>
                                  )}
                            </span>
                          ) : (
                            <span className="font-semibold text-green-600">Free</span>
                          )}
                          <span className="text-gray-400">
                            {ev.registered_count}{ev.max_participants ? `/${ev.max_participants}` : ""} registered
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {reg && reg.payment_status !== "pending" ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                          </span>
                        ) : full ? (
                          <span className="text-xs font-bold text-gray-400 px-3 py-2">Full</span>
                        ) : (
                          <button
                            onClick={() => register(ev)}
                            disabled={registering === ev.id}
                            className="btn-primary text-xs py-2 disabled:opacity-60"
                          >
                            {registering === ev.id
                              ? "…"
                              : myFee > 0 ? `Register · ₹${myFee}` : waived ? "Register Free" : "Register"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lead: attendance */}
                    {isLead && ev.registered_count > 0 && (
                      <LeadAttendance
                        ev={ev} attendanceFor={attendanceFor} registrants={registrants}
                        checked={checked} setChecked={setChecked}
                        openAttendance={openAttendance} saveAttendance={saveAttendance}
                        savingAttendance={savingAttendance} onClose={() => setAttendanceFor(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Impact log (civic clubs, or any club with entries) */}
        {(isCivic || impact.length > 0) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-green-500" /> Impact Log
              </h2>
              {isLead && (
                <button
                  onClick={() => setShowImpactForm((s) => !s)}
                  className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
                >
                  {showImpactForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Log Impact</>}
                </button>
              )}
            </div>

            {isLead && showImpactForm && (
              <form onSubmit={addImpact} className="card p-5 mb-4 space-y-3">
                <input type="text" value={imTitle} onChange={(e) => setImTitle(e.target.value)} maxLength={120}
                  placeholder="Title * — e.g. Plantation drive at Central Avenue" className={INPUT} />
                <textarea value={imDetail} onChange={(e) => setImDetail(e.target.value)} rows={2} maxLength={1000}
                  placeholder="What happened? (optional)" className={`${INPUT} resize-none`} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={imStatLabel} onChange={(e) => setImStatLabel(e.target.value)} maxLength={40}
                    placeholder="Stat label — e.g. Saplings planted" className={INPUT} />
                  <input type="text" value={imStatValue} onChange={(e) => setImStatValue(e.target.value)} maxLength={20}
                    placeholder="Value — e.g. 300" className={INPUT} />
                </div>
                <button type="submit" disabled={leadBusy}
                  className="flex items-center gap-2 btn-primary text-sm disabled:opacity-60">
                  {leadBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Add Entry
                </button>
              </form>
            )}

            {impact.length === 0 && !showImpactForm ? (
              <div className="card p-6 text-center">
                <p className="text-sm text-gray-400">
                  Every drive, cleanup and audit this club completes will be logged here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {impact.map((entry) => (
                  <div key={entry.id} className="card p-4 flex items-center gap-4">
                    {entry.stat_value && (
                      <div className="shrink-0 text-center bg-green-50 rounded-xl px-4 py-2.5 min-w-[80px]">
                        <p className="text-lg font-extrabold text-green-700">{entry.stat_value}</p>
                        {entry.stat_label && (
                          <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">{entry.stat_label}</p>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{entry.title}</p>
                      {entry.detail && <p className="text-xs text-gray-500 mt-0.5">{entry.detail}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(entry.entry_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Past events */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Past Events</h2>
            <div className="space-y-2">
              {past.map((ev) => {
                const reg = myRegFor(ev.id);
                return (
                  <div key={ev.id} className="card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-gray-700">{ev.title}</p>
                      <span className="text-xs text-gray-400">{fmtDate(ev.event_date)} · {ev.registered_count} registered</span>
                      {reg?.attended && (
                        <span className="ml-auto inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          <Trophy className="w-3 h-3" /> +{ev.points_award} pts earned
                        </span>
                      )}
                    </div>
                    {isLead && (
                      <LeadAttendance
                        ev={ev} attendanceFor={attendanceFor} registrants={registrants}
                        checked={checked} setChecked={setChecked}
                        openAttendance={openAttendance} saveAttendance={saveAttendance}
                        savingAttendance={savingAttendance} onClose={() => setAttendanceFor(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Members */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Members</h2>
          <div className="card p-5 flex flex-wrap gap-2">
            {members.map((m) => (
              <span
                key={m.member_name}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  m.role === "lead" ? "bg-brand-600 text-white" : "bg-gray-50 text-gray-600"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 bg-brand-100 text-brand-700 flex items-center justify-center text-[9px] font-bold uppercase">
                  {m.member_name.charAt(0)}
                </span>
                @{m.member_name}
                {m.role === "lead" && " · Lead"}
              </span>
            ))}
            {members.length === 0 && <p className="text-sm text-gray-400">No members yet — be the first!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Lead attendance sub-component ─────────────────────────────────────── */

function LeadAttendance({
  ev, attendanceFor, registrants, checked, setChecked,
  openAttendance, saveAttendance, savingAttendance, onClose,
}: {
  ev: ClubEvent;
  attendanceFor: string | null;
  registrants: Registrant[];
  checked: Set<string>;
  setChecked: React.Dispatch<React.SetStateAction<Set<string>>>;
  openAttendance: (id: string) => void;
  saveAttendance: (id: string) => void;
  savingAttendance: boolean;
  onClose: () => void;
}) {
  const open = attendanceFor === ev.id;
  return (
    <div className="mt-3 pt-3 border-t border-gray-50">
      {!open ? (
        <button
          onClick={() => openAttendance(ev.id)}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          {ev.status === "completed" ? "Edit attendance" : "Mark attendance & award points"}
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-600">
            Tick who showed up — each earns {ev.points_award} points:
          </p>
          {registrants.length === 0 ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-1.5">
              {registrants.map((r) => (
                <label
                  key={r.user_id}
                  className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(r.user_id)}
                    onChange={(e) => {
                      setChecked((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(r.user_id); else next.delete(r.user_id);
                        return next;
                      });
                    }}
                    className="accent-brand-600"
                  />
                  @{r.participant_name}
                  {r.is_member && <span className="text-[10px] text-brand-600 font-bold">MEMBER</span>}
                  {r.payment_status === "paid" && <span className="text-[10px] text-green-600 font-bold">PAID</span>}
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => saveAttendance(ev.id)}
              disabled={savingAttendance}
              className="btn-primary text-xs py-2 disabled:opacity-60"
            >
              {savingAttendance ? "Saving…" : `Save & Award Points (${checked.size})`}
            </button>
            <button onClick={onClose} className="text-xs font-semibold text-gray-500 px-3">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
