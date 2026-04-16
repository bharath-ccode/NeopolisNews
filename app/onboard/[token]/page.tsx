"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Phone,
  CheckCircle,
  ArrowRight,
  Loader2,
  Clock,
  Mail,
  AlertCircle,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";
import {
  getBusinessById,
  saveBusiness,
  DEFAULT_TIMINGS,
  type BusinessRecord,
  type DayTiming,
  type SocialLinks,
} from "@/lib/businessStore";

// ─── Input / label helpers ───────────────────────────────────────────────────

const INPUT =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";

const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

// ─── Mask email for display ──────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  const masked = "*".repeat(Math.max(2, user.length - 2));
  return `${visible}${masked}@${domain}`;
}

// ─── Timings editor ──────────────────────────────────────────────────────────

function TimingsEditor({
  timings,
  onChange,
}: {
  timings: DayTiming[];
  onChange: (t: DayTiming[]) => void;
}) {
  function update(idx: number, patch: Partial<DayTiming>) {
    const next = timings.map((t, i) => (i === idx ? { ...t, ...patch } : t));
    onChange(next);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-28">
              Day
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-24">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">
              Opens
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">
              Closes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {timings.map((t, idx) => (
            <tr key={t.day} className={t.closed ? "bg-gray-50/50" : ""}>
              <td className="px-4 py-2.5 font-medium text-gray-700 text-sm">
                {t.day.slice(0, 3)}
              </td>
              <td className="px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => update(idx, { closed: !t.closed })}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                    t.closed
                      ? "bg-gray-100 border-gray-200 text-gray-400"
                      : "bg-green-50 border-green-200 text-green-700"
                  }`}
                >
                  {t.closed ? "Closed" : "Open"}
                </button>
              </td>
              <td className="px-4 py-2.5">
                {t.closed ? (
                  <span className="text-gray-300 text-xs">—</span>
                ) : (
                  <input
                    type="time"
                    value={t.open}
                    onChange={(e) => update(idx, { open: e.target.value })}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                )}
              </td>
              <td className="px-4 py-2.5">
                {t.closed ? (
                  <span className="text-gray-300 text-xs">—</span>
                ) : (
                  <input
                    type="time"
                    value={t.close}
                    onChange={(e) => update(idx, { close: e.target.value })}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Step = "verify" | "complete" | "done";

export default function OnboardPage() {
  const { token } = useParams<{ token: string }>();

  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [alreadyActive, setAlreadyActive] = useState(false);

  const [step, setStep] = useState<Step>("verify");

  // Verify step
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Complete step
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [timings, setTimings] = useState<DayTiming[]>(DEFAULT_TIMINGS.map((t) => ({ ...t })));
  const [email, setEmail] = useState("");
  const [social, setSocial] = useState<SocialLinks>({});
  const [saving, setSaving] = useState(false);
  const [completeError, setCompleteError] = useState("");

  // ── Load business on mount ──────────────────────────────────────────────

  useEffect(() => {
    const record = getBusinessById(token);
    if (!record) {
      setNotFound(true);
      return;
    }
    setBusiness(record);
    if (record.status === "active") {
      setAlreadyActive(true);
    }
    // Pre-fill existing values if returning to complete
    if (record.contactPhone) setContactPhone(record.contactPhone.replace(/^\+91/, ""));
    if (record.email) setEmail(record.email);
    if (record.description) setDescription(record.description);
    if (record.timings) setTimings(record.timings);
    if (record.socialLinks) setSocial(record.socialLinks);
    // Skip OTP for admin-verified businesses
    if (record.verified && record.status !== "active") {
      setStep("complete");
    }
  }, [token]);

  // ── OTP: send via Resend ────────────────────────────────────────────────

  async function handleSendOtp() {
    setVerifyError("");
    if (phone.length < 10) {
      setVerifyError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!business) return;

    // Verify phone matches the registered owner phone
    const entered = phone.replace(/\D/g, "").slice(-10);
    const registered = business.ownerPhone.replace(/\D/g, "").slice(-10);

    if (entered !== registered) {
      setVerifyError(
        "This phone number is not registered for this business. Contact the administrator."
      );
      return;
    }

    if (!business.email) {
      setVerifyError(
        "No email address on file for this business. Contact the administrator to add one."
      );
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: token,
          email: business.email,
          businessName: business.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error ?? "Failed to send OTP. Please try again.");
        return;
      }
      setOtpSent(true);
    } catch {
      setVerifyError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  // ── OTP: verify via API ─────────────────────────────────────────────────

  async function handleVerifyOtp() {
    setVerifyError("");
    if (otp.length < 6) {
      setVerifyError("Please enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: token, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error ?? "Verification failed. Please try again.");
        return;
      }
      setStep("complete");
    } catch {
      setVerifyError("Network error. Please check your connection and try again.");
    } finally {
      setVerifying(false);
    }
  }

  // ── Complete profile ────────────────────────────────────────────────────

  async function handleComplete() {
    setCompleteError("");
    if (!business) return;
    if (!contactPhone.trim() || contactPhone.length < 10) {
      setCompleteError("Please enter a valid 10-digit customer contact number.");
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const updated: BusinessRecord = {
      ...business,
      contactPhone: `+91${contactPhone}`,
      description: description.trim() || undefined,
      timings,
      email: email.trim() || business.email,
      socialLinks: {
        instagram: social.instagram?.trim() || undefined,
        facebook: social.facebook?.trim() || undefined,
        youtube: social.youtube?.trim() || undefined,
      },
      status: "active",
      completedAt: new Date().toISOString(),
    };
    saveBusiness(updated);
    setBusiness(updated);
    setSaving(false);
    setStep("done");
  }

  // ── Logo header ─────────────────────────────────────────────────────────

  function Header() {
    return (
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Neopolis<span className="text-brand-600">News</span>
          </span>
        </Link>
        {business && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Business Onboarding
            </p>
            <h1 className="text-xl font-extrabold text-gray-900">
              {business.name}
            </h1>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
              {business.types.map((t) => (
                <span key={t} className="tag-blue text-xs">{t}</span>
              ))}
            </div>
            {business.subtypes.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {business.subtypes.join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Link Not Found
        </h1>
        <p className="text-sm text-gray-500 max-w-xs">
          This invite link is invalid or has expired. Please contact the
          NeopolisNews team for a new link.
        </p>
      </div>
    );
  }

  // ── Already active ──────────────────────────────────────────────────────

  if (alreadyActive && step !== "done") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Header />
        <div className="w-full max-w-sm card p-6">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Already Active
          </h2>
          <p className="text-sm text-gray-500">
            <strong>{business?.name}</strong> is already live on NeopolisNews.
          </p>
        </div>
      </div>
    );
  }

  // ── STEP: Verify ────────────────────────────────────────────────────────

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <Header />

        <div className="w-full max-w-sm card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Verify Your Identity
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Enter the phone number registered for this business. We&apos;ll
            send a verification code to the owner&apos;s email address.
          </p>

          {verifyError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              {verifyError}
            </p>
          )}

          {!otpSent ? (
            <>
              <label className={LABEL}>Phone Number</label>
              <div className="flex mb-4">
                <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="9900000000"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={sending}
                className="btn-primary w-full justify-center"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {sending ? "Sending Code…" : "Send Verification Code"}
              </button>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <Mail className="w-4 h-4 text-green-700 shrink-0" />
                  <p className="font-semibold text-green-800 text-sm">Code Sent!</p>
                </div>
                <p className="text-green-700 text-xs mt-0.5 pl-6">
                  A 6-digit code was sent to{" "}
                  <strong>
                    {business?.email ? maskEmail(business.email) : "your registered email"}
                  </strong>
                  . Check your inbox.
                </p>
              </div>

              <label className={LABEL}>Enter Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="• • • • • •"
                maxLength={6}
                className={INPUT + " text-center text-xl tracking-[0.4em] font-mono mb-4"}
              />

              <button
                onClick={handleVerifyOtp}
                disabled={verifying}
                className="btn-primary w-full justify-center mb-3"
              >
                {verifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {verifying ? "Verifying…" : "Verify & Continue"}
              </button>

              <button
                onClick={() => { setOtpSent(false); setOtp(""); setVerifyError(""); }}
                className="w-full text-sm text-gray-400 hover:text-gray-600 text-center"
              >
                Change number / resend code
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── STEP: Complete profile ───────────────────────────────────────────────

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-xl mx-auto">
          <Header />

          <div className="card p-6 mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Complete Your Listing
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Add your operating hours and a short description. You can always
              edit these later.
            </p>

            {completeError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
                {completeError}
              </p>
            )}

            <div className="space-y-6">
              {/* Customer contact number */}
              <div>
                <label className={LABEL}>
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  Customer Contact Number{" "}
                  <span className="font-normal text-gray-400">
                    — displayed on your listing for customers to call
                  </span>
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) =>
                      setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="9900000000"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={LABEL}>
                  About the Business{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers what makes your place special — vibe, specialties, what to expect…"
                  rows={3}
                  maxLength={300}
                  className={INPUT + " resize-none"}
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">
                  {description.length}/300
                </p>
              </div>

              {/* Types + Subtypes */}
              {business && (business.types.length > 0 || business.subtypes.length > 0) && (
                <div>
                  <label className={LABEL}>What you offer</label>
                  {business.types.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {business.types.map((t) => (
                        <span key={t} className="tag-blue">{t}</span>
                      ))}
                    </div>
                  )}
                  {business.subtypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {business.subtypes.map((s) => (
                        <span
                          key={s}
                          className="bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    Contact the admin to update types or offerings.
                  </p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className={LABEL}>
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email Address{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={INPUT}
                />
              </div>

              {/* Social media */}
              <div>
                <label className={LABEL}>
                  Social Media{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="space-y-2">
                  {(
                    [
                      { key: "instagram", icon: Instagram, placeholder: "https://instagram.com/yourbusiness", color: "text-pink-500" },
                      { key: "facebook",  icon: Facebook,  placeholder: "https://facebook.com/yourbusiness",  color: "text-blue-600" },
                      { key: "youtube",   icon: Youtube,   placeholder: "https://youtube.com/@yourchannel",   color: "text-red-500"  },
                    ] as const
                  ).map(({ key, icon: Icon, placeholder, color }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                      <input
                        type="url"
                        value={social[key] ?? ""}
                        onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value || undefined }))}
                        placeholder={placeholder}
                        className={INPUT}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating hours */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500">
                    Operating Hours
                  </label>
                </div>
                <TimingsEditor timings={timings} onChange={setTimings} />
                <p className="text-xs text-gray-400 mt-1.5">
                  Click Open/Closed to toggle. Hours are in 24-hour format.
                </p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={saving}
              className="btn-primary w-full justify-center mt-6"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {saving ? "Publishing…" : "Publish My Listing"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: Done ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          You&apos;re Live!
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          <strong>{business?.name}</strong> is now active on NeopolisNews.
          Customers in Neopolis can find you in the directory.
        </p>

        {/* Timing summary */}
        {timings.length > 0 && (
          <div className="card p-4 mb-5 text-left">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Your Operating Hours
            </p>
            <div className="space-y-1">
              {timings.map((t) => (
                <div key={t.day} className="flex justify-between text-xs">
                  <span className="text-gray-500 w-20">{t.day.slice(0, 3)}</span>
                  {t.closed ? (
                    <span className="text-gray-300">Closed</span>
                  ) : (
                    <span className="text-gray-800 font-medium">
                      {t.open} – {t.close}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/" className="btn-primary w-full justify-center">
          Go to NeopolisNews
        </Link>
      </div>
    </div>
  );
}
