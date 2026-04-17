"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building2, ArrowLeft, ArrowRight, CheckCircle, Mail,
  Phone, Loader2, ShieldCheck, ExternalLink, Lock,
  FileText, Upload, Clock, AlertCircle,
} from "lucide-react";
import { DEFAULT_TIMINGS, type DayTiming } from "@/lib/businessStore";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────

type Phase =
  | "loading"         // fetching business
  | "identity"        // has owner_email — enter email/phone to match
  | "otp-profile"     // OTP + fill profile (identity-match path)
  | "verify-request"  // no owner_email — submit proof of ownership
  | "request-sent"    // verification request submitted
  | "pending"         // status is "pending", waiting for admin
  | "verified-form"   // status "verified" + token in URL — fill profile
  | "no-token"        // status "verified" but no token in URL
  | "already-active"
  | "done";

interface BizInfo {
  id: string;
  name: string;
  status: string;
  hasOwnerEmail: boolean;
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

// ─── TimingsEditor ──────────────────────────────────────────────────────────

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

// ─── ProfileFields ──────────────────────────────────────────────────────────

function ProfileFields({
  contactPhone, setContactPhone,
  description, setDescription,
  timings, setTimings,
  instagram, setInstagram,
  facebook, setFacebook,
  youtube, setYoutube,
  userExists,
  password, setPassword,
  confirmPassword, setConfirmPassword,
}: {
  contactPhone: string; setContactPhone: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  timings: DayTiming[]; setTimings: (v: DayTiming[]) => void;
  instagram: string; setInstagram: (v: string) => void;
  facebook: string; setFacebook: (v: string) => void;
  youtube: string; setYoutube: (v: string) => void;
  userExists: boolean;
  password: string; setPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Account */}
      {userExists ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-900">You already have an account</p>
            <p className="text-xs text-blue-700 mt-0.5">
              This business will be linked to your existing NeopolisNews account.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
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
      )}

      <hr className="border-gray-100" />
      <p className="text-sm font-bold text-gray-900">Complete Your Profile</p>

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
            { val: instagram, set: setInstagram, ph: "https://instagram.com/yourbusiness" },
            { val: facebook,  set: setFacebook,  ph: "https://facebook.com/yourbusiness"  },
            { val: youtube,   set: setYoutube,   ph: "https://youtube.com/@yourchannel"   },
          ] as const).map(({ val, set, ph }) => (
            <input key={ph} type="url" value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className={INPUT} />
          ))}
        </div>
      </div>

      <div>
        <label className={LABEL}>Operating Hours</label>
        <TimingsEditor timings={timings} onChange={setTimings} />
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ClaimBusinessPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [phase, setPhase] = useState<Phase>("loading");
  const [biz, setBiz] = useState<BizInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Identity-match state
  const [identifier, setIdentifier] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [otp, setOtp] = useState("");

  // Verify-request state
  const [vrName, setVrName] = useState("");
  const [vrEmail, setVrEmail] = useState("");
  const [vrPhone, setVrPhone] = useState("");
  const [vrProofUrl, setVrProofUrl] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const proofRef = useRef<HTMLInputElement>(null);

  // 24h token from URL
  const [urlToken, setUrlToken] = useState<string | null>(null);

  // Profile fields (shared between identity-match and 24h token paths)
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [timings, setTimings] = useState<DayTiming[]>(DEFAULT_TIMINGS.map((t) => ({ ...t })));
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // On mount: fetch business status and read URL token
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    setUrlToken(token);

    const supabase = createClient();
    supabase
      .from("businesses")
      .select("id, name, status, owner_email")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!data) { setPhase("already-active"); return; }

        setBiz({ id: data.id, name: data.name, status: data.status, hasOwnerEmail: !!data.owner_email });

        if (data.status === "active") { setPhase("already-active"); return; }
        if (data.status === "pending") { setPhase("pending"); return; }
        if (data.status === "verified") {
          setPhase(token ? "verified-form" : "no-token");
          return;
        }
        // "invited" — branch on whether owner_email is known
        if (data.owner_email) { setPhase("identity"); return; }
        setPhase("verify-request");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profileUrl = `/businesses/${id}`;

  // ── Handlers ──────────────────────────────────────────────────────────────

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
      setUserExists(data.userExists ?? false);
      setPhase("otp-profile");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function submitOtpProfile() {
    if (otp.length < 6) return setError("Please enter the 6-digit code.");
    if (!userExists) {
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          password: userExists ? undefined : password,
          contactPhone: contactPhone ? `+91${contactPhone}` : null,
          description: description.trim() || null,
          timings,
          socialLinks: { instagram: instagram.trim() || undefined, facebook: facebook.trim() || undefined, youtube: youtube.trim() || undefined },
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Could not complete claim.");
      setPhase("done");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function submitVerifyRequest() {
    if (!vrName.trim()) return setError("Please enter your full name.");
    if (!vrEmail.includes("@")) return setError("Please enter a valid email address.");
    if (vrPhone.length < 10) return setError("Please enter a valid phone number.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${id}/verify-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: vrName.trim(), email: vrEmail.trim(), phone: `+91${vrPhone}`, proofUrl: vrProofUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Submission failed.");
      setPhase("request-sent");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function submitClaimForm() {
    if (!userExists) {
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
    }
    if (!urlToken) return setError("Claim token missing. Please use the link from your email.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimToken: urlToken,
          password: userExists ? undefined : password,
          contactPhone: contactPhone ? `+91${contactPhone}` : null,
          description: description.trim() || null,
          timings,
          socialLinks: { instagram: instagram.trim() || undefined, facebook: facebook.trim() || undefined, youtube: youtube.trim() || undefined },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "token_expired") setPhase("no-token");
        return setError(data.error ?? "Could not complete claim.");
      }
      setPhase("done");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function uploadProof(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProof(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) setVrProofUrl(data.url);
    setUploadingProof(false);
    if (proofRef.current) proofRef.current.value = "";
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const header = (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
      <Link href={profileUrl} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
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
  );

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        {header}
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {header}
      <div className="max-w-xl mx-auto px-4 py-10">

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* ── Already active ──────────────────────────────────────────────── */}
        {phase === "already-active" && (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Already Claimed</h1>
            <p className="text-sm text-gray-500 mb-5">This business has already been claimed by its owner.</p>
            <Link href={profileUrl} className="btn-primary inline-flex justify-center">
              <ExternalLink className="w-4 h-4" /> View Profile
            </Link>
          </div>
        )}

        {/* ── Identity match ──────────────────────────────────────────────── */}
        {phase === "identity" && (
          <div className="card p-6">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
              <ShieldCheck className="w-7 h-7 text-brand-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Claim This Business</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter the email or phone number on file for <strong>{biz?.name}</strong> to receive a verification code.
            </p>
            <div>
              <label className={LABEL}><Mail className="w-3.5 h-3.5 inline mr-1" />Email or Phone Number</label>
              <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 9900000000" className={INPUT}
                onKeyDown={(e) => e.key === "Enter" && submitIdentity()} />
            </div>
            <button onClick={submitIdentity} disabled={loading} className="btn-primary w-full justify-center mt-5">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</> : <>Send Verification Code <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* ── OTP + profile (identity-match path) ─────────────────────────── */}
        {phase === "otp-profile" && (
          <div className="card p-6">
            <button onClick={() => { setError(""); setPhase("identity"); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <p className="font-semibold text-green-800 text-sm">Code sent to {maskedEmail}</p>
              <p className="text-green-700 text-xs mt-0.5">Enter the 6-digit code below, then complete your profile.</p>
            </div>
            <div className="mb-5">
              <label className={LABEL}>Verification Code</label>
              <input type="text" inputMode="numeric" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •" maxLength={6}
                className={INPUT + " text-center text-2xl tracking-[0.4em] font-mono"} />
            </div>
            <ProfileFields
              contactPhone={contactPhone} setContactPhone={setContactPhone}
              description={description} setDescription={setDescription}
              timings={timings} setTimings={setTimings}
              instagram={instagram} setInstagram={setInstagram}
              facebook={facebook} setFacebook={setFacebook}
              youtube={youtube} setYoutube={setYoutube}
              userExists={userExists}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            />
            <button onClick={submitOtpProfile} disabled={loading} className="btn-primary w-full justify-center mt-6">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><CheckCircle className="w-4 h-4" /> Verify &amp; Publish</>}
            </button>
          </div>
        )}

        {/* ── Verify-request form ─────────────────────────────────────────── */}
        {phase === "verify-request" && (
          <div className="card p-6">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
              <FileText className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Request Ownership</h1>
            <p className="text-sm text-gray-500 mb-6">
              We don&apos;t have contact details on file for <strong>{biz?.name}</strong> yet.
              Submit your details and a proof of business. Our team will verify and send you a claim link within 24–48 hours.
            </p>
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Your Full Name</label>
                <input type="text" value={vrName} onChange={(e) => setVrName(e.target.value)}
                  placeholder="As it appears on business documents" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}><Mail className="w-3.5 h-3.5 inline mr-1" />Email Address</label>
                <input type="email" value={vrEmail} onChange={(e) => setVrEmail(e.target.value)}
                  placeholder="you@example.com" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}><Phone className="w-3.5 h-3.5 inline mr-1" />Phone Number</label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">+91</span>
                  <input type="tel" value={vrPhone}
                    onChange={(e) => setVrPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9900000000"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className={LABEL}>
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  Proof of Business <span className="font-normal text-gray-400">(optional but speeds up verification)</span>
                </label>
                {vrProofUrl ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm text-green-800 font-medium">File uploaded</span>
                    <button onClick={() => setVrProofUrl("")} className="ml-auto text-xs text-gray-400 hover:text-red-500">Remove</button>
                  </div>
                ) : (
                  <button onClick={() => proofRef.current?.click()} disabled={uploadingProof}
                    className="w-full border-2 border-dashed border-gray-200 hover:border-brand-300 rounded-xl p-5 flex flex-col items-center gap-2 text-gray-400 hover:text-brand-600 transition-colors">
                    {uploadingProof ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    <span className="text-sm">{uploadingProof ? "Uploading…" : "Upload GST certificate, trade licence, or shop photo"}</span>
                    <span className="text-xs">PDF, JPG, PNG · max 5 MB</span>
                  </button>
                )}
                <input ref={proofRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={uploadProof} />
              </div>
            </div>
            <button onClick={submitVerifyRequest} disabled={loading} className="btn-primary w-full justify-center mt-6">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Submit Ownership Request <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* ── Request sent ────────────────────────────────────────────────── */}
        {phase === "request-sent" && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-9 h-9 text-amber-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Request Submitted!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Our team will review your request and send a claim link to your email within <strong>24–48 hours</strong>.
              Once verified, the link will be valid for 24 hours.
            </p>
            <Link href={profileUrl} className="inline-flex items-center justify-center gap-2 text-sm text-brand-600 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to business profile
            </Link>
          </div>
        )}

        {/* ── Pending review ──────────────────────────────────────────────── */}
        {phase === "pending" && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-9 h-9 text-amber-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Verification In Progress</h1>
            <p className="text-gray-500 text-sm mb-6">
              A claim request for <strong>{biz?.name}</strong> is currently being reviewed.
              You&apos;ll receive an email with a claim link once approved.
            </p>
            <Link href={profileUrl} className="inline-flex items-center justify-center gap-2 text-sm text-brand-600 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to business profile
            </Link>
          </div>
        )}

        {/* ── Verified — no token ─────────────────────────────────────────── */}
        {phase === "no-token" && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-9 h-9 text-brand-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-500 text-sm mb-2">
              A verified claim link has been sent to the email address on file for <strong>{biz?.name}</strong>.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              The link is valid for 24 hours. If it expired, contact the NeopolisNews team for a new one.
            </p>
            <Link href={profileUrl} className="inline-flex items-center justify-center gap-2 text-sm text-brand-600 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to business profile
            </Link>
          </div>
        )}

        {/* ── Verified — fill profile (24h token path) ────────────────────── */}
        {phase === "verified-form" && (
          <div className="card p-6">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <p className="font-semibold text-green-800 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Identity Verified by NeopolisNews
              </p>
              <p className="text-green-700 text-xs mt-0.5">
                Complete your profile below to publish <strong>{biz?.name}</strong> and go live.
              </p>
            </div>
            <ProfileFields
              contactPhone={contactPhone} setContactPhone={setContactPhone}
              description={description} setDescription={setDescription}
              timings={timings} setTimings={setTimings}
              instagram={instagram} setInstagram={setInstagram}
              facebook={facebook} setFacebook={setFacebook}
              youtube={youtube} setYoutube={setYoutube}
              userExists={userExists}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            />
            <button onClick={submitClaimForm} disabled={loading} className="btn-primary w-full justify-center mt-6">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><CheckCircle className="w-4 h-4" /> Publish My Business</>}
            </button>
          </div>
        )}

        {/* ── Done ────────────────────────────────────────────────────────── */}
        {phase === "done" && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re Live!</h1>
            <p className="text-gray-500 text-sm mb-6">
              {userExists
                ? "This business has been added to your account."
                : "Your business profile is now published on NeopolisNews."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/my-business/login" className="btn-primary inline-flex justify-center">
                <Lock className="w-4 h-4" /> {userExists ? "Sign In to My Business" : "Go to My Business"}
              </Link>
              <Link href={profileUrl} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <ExternalLink className="w-4 h-4" /> View Profile
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
