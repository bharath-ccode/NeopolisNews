"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  Building2, ArrowLeft, ArrowRight, CheckCircle,
  Mail, Phone, Loader2, ShieldCheck, ExternalLink,
} from "lucide-react";
import { DEFAULT_TIMINGS, type DayTiming } from "@/lib/businessStore";

type Step = "identity" | "profile" | "done";

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

function TimingsEditor({ timings, onChange }: { timings: DayTiming[]; onChange: (t: DayTiming[]) => void }) {
  function update(idx: number, patch: Partial<DayTiming>) {
    onChange(timings.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-24">Day</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-20">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Opens</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Closes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {timings.map((t, idx) => (
            <tr key={t.day} className={t.closed ? "bg-gray-50/50" : ""}>
              <td className="px-4 py-2.5 font-medium text-gray-700 text-sm">{t.day.slice(0, 3)}</td>
              <td className="px-4 py-2.5">
                <button type="button" onClick={() => update(idx, { closed: !t.closed })}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                    t.closed ? "bg-gray-100 border-gray-200 text-gray-400" : "bg-green-50 border-green-200 text-green-700"
                  }`}>
                  {t.closed ? "Closed" : "Open"}
                </button>
              </td>
              <td className="px-4 py-2.5">
                {t.closed ? <span className="text-gray-300 text-xs">—</span> : (
                  <input type="time" value={t.open} onChange={(e) => update(idx, { open: e.target.value })}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                )}
              </td>
              <td className="px-4 py-2.5">
                {t.closed ? <span className="text-gray-300 text-xs">—</span> : (
                  <input type="time" value={t.close} onChange={(e) => update(idx, { close: e.target.value })}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ClaimBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [step, setStep] = useState<Step>("identity");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 — identity
  const [identifier, setIdentifier] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  // Step 2 — otp + profile
  const [otp, setOtp] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [timings, setTimings] = useState<DayTiming[]>(DEFAULT_TIMINGS.map((t) => ({ ...t })));
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");

  async function submitIdentity() {
    const val = identifier.trim();
    if (!val) return setError("Please enter your email address or phone number.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: val }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Verification failed.");
      setMaskedEmail(data.maskedEmail ?? "");
      setStep("profile");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitProfile() {
    if (otp.length < 6) return setError("Please enter the 6-digit code.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          contactPhone: contactPhone ? `+91${contactPhone}` : null,
          description: description.trim() || null,
          timings,
          socialLinks: {
            instagram: instagram.trim() || undefined,
            facebook: facebook.trim() || undefined,
            youtube: youtube.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Could not complete claim.");
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const profileUrl = `/businesses/${id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link
          href={profileUrl}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">
            Neopolis<span className="text-brand-600">News</span>
            <span className="text-gray-400 font-normal"> · Claim Your Business</span>
          </span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* ── Step 1: Verify Identity ───────────────────────────────────────── */}
        {step === "identity" && (
          <div className="card p-6">
            {/* Icon */}
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
              <ShieldCheck className="w-7 h-7 text-brand-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Claim This Business</h1>
            <p className="text-sm text-gray-500 mb-6">
              This listing was created by our team. If you&apos;re the owner, enter the email address or phone number
              on file to receive a verification code.
            </p>

            <div className="space-y-4">
              <div>
                <label className={LABEL}>
                  <Mail className="w-3.5 h-3.5 inline mr-1" />Email or Phone Number
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or 9900000000"
                  className={INPUT}
                  onKeyDown={(e) => e.key === "Enter" && submitIdentity()}
                />
              </div>
            </div>

            <button
              onClick={submitIdentity}
              disabled={loading}
              className="btn-primary w-full justify-center mt-6"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
              ) : (
                <>Send Verification Code <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Don&apos;t own this business?{" "}
              <Link href={profileUrl} className="text-brand-600 hover:underline">
                View the listing
              </Link>
            </p>
          </div>
        )}

        {/* ── Step 2: OTP + Profile ─────────────────────────────────────────── */}
        {step === "profile" && (
          <div className="card p-6">
            <button
              onClick={() => { setError(""); setStep("identity"); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <p className="font-semibold text-green-800 text-sm">Code sent to {maskedEmail}</p>
              <p className="text-green-700 text-xs mt-0.5">
                Enter the 6-digit code below, then complete your business profile.
              </p>
            </div>

            <div className="mb-5">
              <label className={LABEL}>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                maxLength={6}
                className={INPUT + " text-center text-2xl tracking-[0.4em] font-mono"}
              />
            </div>

            <hr className="my-5 border-gray-100" />
            <p className="text-sm font-bold text-gray-900 mb-4">Complete Your Profile</p>

            <div className="space-y-4">
              <div>
                <label className={LABEL}>
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  Customer Contact Number{" "}
                  <span className="font-normal text-gray-400">— shown on listing</span>
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9900000000"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>
                  About Your Business{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes your place special…"
                  rows={3}
                  maxLength={300}
                  className={INPUT + " resize-none"}
                />
              </div>

              <div>
                <label className={LABEL}>
                  Social Media{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="space-y-2">
                  {([
                    { val: instagram, set: setInstagram, ph: "https://instagram.com/yourbusiness", label: "Instagram" },
                    { val: facebook, set: setFacebook, ph: "https://facebook.com/yourbusiness", label: "Facebook" },
                    { val: youtube, set: setYoutube, ph: "https://youtube.com/@yourchannel", label: "YouTube" },
                  ] as const).map(({ val, set, ph, label }) => (
                    <input
                      key={label}
                      type="url"
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={ph}
                      className={INPUT}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className={LABEL}>Operating Hours</label>
                <TimingsEditor timings={timings} onChange={setTimings} />
              </div>
            </div>

            <button
              onClick={submitProfile}
              disabled={loading}
              className="btn-primary w-full justify-center mt-6"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Verify &amp; Publish</>
              )}
            </button>
          </div>
        )}

        {/* ── Done ─────────────────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re Live!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your business profile is now published on NeopolisNews. Share it with your customers.
            </p>
            <Link
              href={profileUrl}
              className="btn-primary inline-flex justify-center"
            >
              <ExternalLink className="w-4 h-4" /> View Your Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
