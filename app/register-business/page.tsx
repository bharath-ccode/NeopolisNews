"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, ArrowLeft, ArrowRight, CheckCircle,
  Mail, Phone, MapPin, Loader2, ExternalLink, Lock,
} from "lucide-react";
import {
  getIndustries, getTypes, getSubtypesByTypes,
} from "@/lib/businessDirectory";
import { DEFAULT_TIMINGS, type DayTiming } from "@/lib/businessStore";

type Step = "info" | "owner" | "verify" | "profile" | "done";

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

function Chip({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
        checked ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"
      }`}
    >
      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-brand-600 border-brand-600" : "border-gray-300"
      }`}>
        {checked && <CheckCircle className="w-3 h-3 text-white" />}
      </span>
      {label}
    </button>
  );
}

const STEP_LABELS = ["Business Info", "Your Details", "Verify", "Profile", "Done"];

function Steps({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
              done ? "bg-brand-600 border-brand-600 text-white" :
              active ? "border-brand-600 text-brand-600 bg-white" :
              "border-gray-200 text-gray-300 bg-white"
            }`}>
              {done ? <CheckCircle className="w-3.5 h-3.5" /> : n}
            </div>
            <span className={`text-xs font-semibold hidden sm:block truncate ${active ? "text-gray-900" : "text-gray-400"}`}>
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-gray-200 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

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

export default function RegisterBusinessPage() {
  const [step, setStep] = useState<Step>("info");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 — business info
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [address, setAddress] = useState("");

  // Step 2 — owner details
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  // Step 3 — OTP verify
  const [businessId, setBusinessId] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 4 — profile
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [timings, setTimings] = useState<DayTiming[]>(DEFAULT_TIMINGS.map((t) => ({ ...t })));
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");

  const allTypes = industry ? getTypes(industry) : [];
  const subtypeGroups = industry ? getSubtypesByTypes(industry, selectedTypes) : {};

  function handleIndustryChange(val: string) {
    setIndustry(val); setSelectedTypes([]); setSelectedSubtypes([]);
  }
  function toggleType(t: string) {
    setSelectedTypes((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      const validSubs = Object.values(getSubtypesByTypes(industry, next)).flat();
      setSelectedSubtypes((s) => s.filter((x) => validSubs.includes(x)));
      return next;
    });
  }
  function toggleSubtype(s: string) {
    setSelectedSubtypes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function goToOwner() {
    if (!name.trim()) return setError("Please enter the business name.");
    if (!industry) return setError("Please select an industry.");
    if (!selectedTypes.length) return setError("Please select at least one type.");
    if (!address.trim()) return setError("Please enter the address.");
    setError(""); setStep("owner");
  }

  async function submitOwner() {
    if (!ownerEmail.includes("@")) return setError("Please enter a valid email address.");
    if (ownerPhone.length < 10) return setError("Please enter a valid 10-digit phone number.");
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/businesses/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, industry, types: selectedTypes, subtypes: selectedSubtypes,
          address, ownerEmail, ownerPhone: `+91${ownerPhone}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Registration failed.");
      setBusinessId(data.id);
      setStep("verify");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitProfile() {
    if (otp.length < 6) return setError("Please enter the 6-digit code.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          password,
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
      if (!res.ok) return setError(data.error ?? "Verification failed.");
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stepNum = ["info", "owner", "verify", "profile", "done"].indexOf(step) + 1;
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/businesses/${businessId}` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">
            Neopolis<span className="text-brand-600">News</span>
            <span className="text-gray-400 font-normal"> · Register Your Business</span>
          </span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-10">
        {step !== "done" && <Steps current={stepNum} />}

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* ── Step 1: Business Info ─────────────────────────────────────────── */}
        {step === "info" && (
          <div className="card p-6">
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Your Business</h1>
            <p className="text-sm text-gray-500 mb-6">Tell us about your business — name, category, and location.</p>
            <div className="space-y-5">
              <div>
                <label className={LABEL}>Business Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chapter Coffee" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Industry</label>
                <select value={industry} onChange={(e) => handleIndustryChange(e.target.value)} className={INPUT}>
                  <option value="">Select industry…</option>
                  {getIndustries().map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              {industry && (
                <div>
                  <label className={LABEL}>Type <span className="font-normal text-gray-400">(select all that apply)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {allTypes.map((t) => (
                      <Chip key={t} label={t} checked={selectedTypes.includes(t)} onClick={() => toggleType(t)} />
                    ))}
                  </div>
                </div>
              )}
              {selectedTypes.length > 0 && Object.entries(subtypeGroups).map(([typeName, subs]) => (
                <div key={typeName}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-gray-100" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">{typeName}</span>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {subs.map((s) => (
                      <Chip key={s} label={s} checked={selectedSubtypes.includes(s)} onClick={() => toggleSubtype(s)} />
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <label className={LABEL}><MapPin className="w-3.5 h-3.5 inline mr-1" />Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop / unit, building, street, area, city — PIN"
                  rows={3} className={INPUT + " resize-none"} />
              </div>
            </div>
            <button onClick={goToOwner} className="btn-primary w-full justify-center mt-6">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Owner Details ─────────────────────────────────────────── */}
        {step === "owner" && (
          <div className="card p-6">
            <button onClick={() => { setError(""); setStep("info"); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Your Details</h1>
            <p className="text-sm text-gray-500 mb-6">
              We&apos;ll send a verification code to your email. Your phone number is used for identity verification only.
            </p>
            <div className="space-y-4">
              <div>
                <label className={LABEL}><Mail className="w-3.5 h-3.5 inline mr-1" />Email Address</label>
                <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="you@example.com" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}><Phone className="w-3.5 h-3.5 inline mr-1" />Phone Number</label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">+91</span>
                  <input type="tel" value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9900000000"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
            </div>
            <button onClick={submitOwner} disabled={loading} className="btn-primary w-full justify-center mt-6">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code…</> : <>Send Verification Code <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* ── Step 3: OTP + Profile ─────────────────────────────────────────── */}
        {step === "verify" && (
          <div className="card p-6">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <p className="font-semibold text-green-800 text-sm">Code sent to {ownerEmail}</p>
              <p className="text-green-700 text-xs mt-0.5">Enter the 6-digit code below, then complete your profile.</p>
            </div>
            <div className="mb-5">
              <label className={LABEL}>Verification Code</label>
              <input type="text" inputMode="numeric" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •" maxLength={6}
                className={INPUT + " text-center text-2xl tracking-[0.4em] font-mono"} />
            </div>
            <hr className="my-5 border-gray-100" />

            {/* Account password */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-5">
              <p className="text-sm font-bold text-brand-900 mb-1 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Create Your Account Password
              </p>
              <p className="text-xs text-brand-700 mb-3">
                You&apos;ll use this to log in and manage your listing at any time.
              </p>
              <div className="space-y-2">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 8 characters)" className={INPUT} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password" className={INPUT} />
              </div>
            </div>

            <p className="text-sm font-bold text-gray-900 mb-4">Complete Your Profile</p>
            <div className="space-y-4">
              <div>
                <label className={LABEL}><Phone className="w-3.5 h-3.5 inline mr-1" />Customer Contact Number <span className="font-normal text-gray-400">— shown on listing</span></label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">+91</span>
                  <input type="tel" value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9900000000"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className={LABEL}>About Your Business <span className="font-normal text-gray-400">(optional)</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes your place special…" rows={3} maxLength={300}
                  className={INPUT + " resize-none"} />
              </div>
              <div>
                <label className={LABEL}>Social Media <span className="font-normal text-gray-400">(optional)</span></label>
                <div className="space-y-2">
                  {([
                    { val: instagram, set: setInstagram, ph: "https://instagram.com/yourbusiness", label: "Instagram" },
                    { val: facebook, set: setFacebook, ph: "https://facebook.com/yourbusiness", label: "Facebook" },
                    { val: youtube, set: setYoutube, ph: "https://youtube.com/@yourchannel", label: "YouTube" },
                  ] as const).map(({ val, set, ph, label }) => (
                    <input key={label} type="url" value={val} onChange={(e) => set(e.target.value)}
                      placeholder={ph} className={INPUT} />
                  ))}
                </div>
              </div>
              <div>
                <label className={LABEL}>Operating Hours</label>
                <TimingsEditor timings={timings} onChange={setTimings} />
              </div>
            </div>
            <button onClick={submitProfile} disabled={loading} className="btn-primary w-full justify-center mt-6">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><CheckCircle className="w-4 h-4" /> Verify &amp; Publish</>}
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
            <p className="text-sm text-gray-500 mb-6">
              <strong>{name}</strong> is now on NeopolisNews. Your public profile is ready to share.
            </p>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
              className="btn-primary w-full justify-center mb-3">
              <ExternalLink className="w-4 h-4" /> View Your Business Profile
            </a>
            <Link href="/my-business" className="btn-secondary w-full justify-center mb-3">
              <Lock className="w-4 h-4" /> Go to My Business
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Back to NeopolisNews
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
