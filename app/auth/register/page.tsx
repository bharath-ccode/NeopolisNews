"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Building2,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Utensils,
  Film,
  ShoppingBag,
  Scissors,
  Coffee,
  Dumbbell,
  Clock,
  Hospital,
  Pill,
  Stethoscope,
  PhoneCall,
} from "lucide-react";
import { useAuth, UserType, RegisterData, BusinessHours } from "@/context/AuthContext";

type Step = "type" | "details" | "verify";

const LIFESTYLE_TYPES = [
  { id: "Restaurant",  label: "Restaurant",    Icon: Utensils,    color: "bg-orange-50 text-orange-600" },
  { id: "Movie Hall",  label: "Movie Hall",    Icon: Film,        color: "bg-purple-50 text-purple-600" },
  { id: "Shop",        label: "Shop / Retail", Icon: ShoppingBag, color: "bg-blue-50 text-blue-600"     },
  { id: "Saloon",      label: "Saloon",        Icon: Scissors,    color: "bg-pink-50 text-pink-600"     },
  { id: "Cafe",        label: "Cafe",          Icon: Coffee,      color: "bg-yellow-50 text-yellow-700" },
  { id: "Fitness",     label: "Fitness & Gym", Icon: Dumbbell,    color: "bg-green-50 text-green-600"   },
  { id: "Other",       label: "Other",         Icon: Building2,   color: "bg-gray-50 text-gray-600"     },
];

const HEALTH_TYPES = [
  { id: "Hospital",  label: "Hospital",  Icon: Hospital,     color: "bg-red-50 text-red-600"  },
  { id: "Pharmacy",  label: "Pharmacy",  Icon: Pill,         color: "bg-teal-50 text-teal-600" },
  { id: "Clinic",    label: "Clinic",    Icon: Stethoscope,  color: "bg-cyan-50 text-cyan-600" },
];

// types that require an emergency / helpline number
const EMERGENCY_TYPES = new Set(["Hospital", "Clinic"]);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type BizType = { id: string; label: string; Icon: React.ComponentType<{ className?: string }>; color: string };

function TypeGrid({
  types,
  selected,
  onSelect,
  healthStyle = false,
}: {
  types: BizType[];
  selected: string;
  onSelect: (id: string) => void;
  healthStyle?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {types.map(({ id, label, Icon, color }) => {
        const sel = selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-center ${
              sel
                ? healthStyle ? "border-red-500 bg-red-50" : "border-brand-500 bg-brand-50"
                : "border-gray-100 hover:border-gray-300 bg-white"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sel ? (healthStyle ? "bg-red-100" : "bg-brand-100") : color}`}>
              <Icon className={`w-4 h-4 ${sel ? (healthStyle ? "text-red-600" : "text-brand-600") : ""}`} />
            </div>
            <span className={`text-xs font-semibold leading-tight ${sel ? (healthStyle ? "text-red-700" : "text-brand-700") : "text-gray-600"}`}>
              {label}
            </span>
            {sel && <CheckCircle className={`w-3.5 h-3.5 ${healthStyle ? "text-red-600" : "text-brand-600"}`} />}
          </button>
        );
      })}
    </div>
  );
}

const OTP_RESEND_SECONDS = 60;

const DEFAULT_HOURS: BusinessHours = {
  open: "09:00",
  close: "21:00",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<Step>("type");
  const [userType, setUserType] = useState<UserType>("individual");

  // Shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");

  // Business only
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [hoursOpen, setHoursOpen] = useState(DEFAULT_HOURS.open);
  const [hoursClose, setHoursClose] = useState(DEFAULT_HOURS.close);
  const [openDays, setOpenDays] = useState<string[]>(DEFAULT_HOURS.days);
  const [gstin, setGstin] = useState("");

  // OTP state
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [resendTimer]);

  // Business is always phone-only; individual can choose email or phone
  const effectiveContactMethod: "email" | "phone" = userType === "business" ? "phone" : contactMethod;
  const contactDisplay = effectiveContactMethod === "email" ? email : `+91 ${phone}`;

  function toggleDay(day: string) {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleGoogle() {
    setLoading(true);
    await loginWithGoogle(userType);
    router.push("/dashboard");
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name) { setError("Please enter your name."); return; }
    if (effectiveContactMethod === "email" && !email) { setError("Please enter your email."); return; }
    if (effectiveContactMethod === "phone" && phone.length < 10) { setError("Please enter a valid 10-digit phone number."); return; }
    if (userType === "business" && !businessName) { setError("Please enter your business name."); return; }
    if (userType === "business" && !businessType) { setError("Please select your business type."); return; }
    if (userType === "business" && openDays.length === 0) { setError("Please select at least one open day."); return; }

    setLoading(true);
    try {
      const contact = effectiveContactMethod === "email" ? email : `+91${phone}`;
      await sendOtp(contact);
      setResendTimer(OTP_RESEND_SECONDS);
      setOtp("");
      setStep("verify");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length < 6) { setError("Please enter the 6-digit OTP."); return; }

    setLoading(true);
    try {
      const contact = effectiveContactMethod === "email" ? email : `+91${phone}`;
      await verifyOtp(contact, otp);
      await register(buildRegisterData());
      router.push("/dashboard");
    } catch {
      setError("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      const contact = effectiveContactMethod === "email" ? email : `+91${phone}`;
      await sendOtp(contact);
      setResendTimer(OTP_RESEND_SECONDS);
      setOtp("");
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function buildRegisterData(): RegisterData {
    return {
      userType,
      name,
      email: effectiveContactMethod === "email" ? email : undefined,
      phone: effectiveContactMethod === "phone" ? `+91${phone}` : undefined,
      password: password || undefined,
      businessName: userType === "business" ? businessName : undefined,
      businessType: userType === "business" ? businessType : undefined,
      businessCategory: userType === "business" ? businessType : undefined,
      emergencyPhone: userType === "business" && EMERGENCY_TYPES.has(businessType) && emergencyPhone
        ? emergencyPhone : undefined,
      businessHours: userType === "business"
        ? { open: hoursOpen, close: hoursClose, days: openDays }
        : undefined,
      gstin: userType === "business" && gstin ? gstin : undefined,
    };
  }

  // ── Logo header ────────────────────────────────────────────────────────────
  const Logo = () => (
    <Link href="/" className="flex items-center gap-2 mb-8">
      <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <span className="text-lg font-bold text-gray-900">
        Neopolis<span className="text-brand-600">News</span>
      </span>
    </Link>
  );

  const ProgressBar = ({ current }: { current: Step }) => {
    const steps: Step[] = ["type", "details", "verify"];
    return (
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              s === current ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-600"
            }`}>
              {idx + 1}
            </div>
            {idx < 2 && <div className="flex-1 h-px w-8 bg-gray-200" />}
          </div>
        ))}
      </div>
    );
  };

  // ── Step 1: Choose type ────────────────────────────────────────────────────
  if (step === "type") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <Logo />
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>

          <p className="text-sm font-semibold text-gray-700 mb-4">I am registering as a…</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setUserType("individual")}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                userType === "individual" ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${userType === "individual" ? "bg-brand-100" : "bg-gray-100"}`}>
                <User className={`w-6 h-6 ${userType === "individual" ? "text-brand-600" : "text-gray-400"}`} />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-gray-900">Individual</p>
                <p className="text-xs text-gray-400 mt-0.5">Home owner / buyer / tenant</p>
              </div>
              {userType === "individual" && <CheckCircle className="w-5 h-5 text-brand-600" />}
            </button>

            <button
              onClick={() => setUserType("business")}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                userType === "business" ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${userType === "business" ? "bg-brand-100" : "bg-gray-100"}`}>
                <Briefcase className={`w-6 h-6 ${userType === "business" ? "text-brand-600" : "text-gray-400"}`} />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-gray-900">Business</p>
                <p className="text-xs text-gray-400 mt-0.5">Restaurant / shop / salon&hellip;</p>
              </div>
              {userType === "business" && <CheckCircle className="w-5 h-5 text-brand-600" />}
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
            {userType === "individual" ? (
              <ul className="space-y-1.5">
                {["Post homes for sale or rent", "Browse and save listings", "Send enquiries to owners", "Get move-in service quotes"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> {i}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-1.5">
                {["Get listed in the business directory", "Show your hours & contact", "Post classifieds & offers", "Analytics dashboard"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> {i}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={() => setStep("details")} className="btn-primary w-full justify-center">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: OTP Verification ───────────────────────────────────────────────
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <Logo />
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <button onClick={() => { setStep("details"); setError(""); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <ProgressBar current="verify" />

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Verify your {effectiveContactMethod}</h1>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            We sent a 6-digit OTP to{" "}
            <span className="font-semibold text-gray-700">{contactDisplay}</span>.
          </p>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

          <form onSubmit={handleVerifySubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">One-time password</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                maxLength={6}
                autoFocus
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xl text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? "Verifying…" : "Verify & Create Account"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            {resendTimer > 0 ? (
              <p className="text-gray-400">Resend OTP in <span className="font-semibold text-gray-600">{resendTimer}s</span></p>
            ) : (
              <button onClick={handleResendOtp} disabled={loading} className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-semibold">
                <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            Wrong contact?{" "}
            <button onClick={() => { setStep("details"); setError(""); }} className="text-brand-600 font-semibold hover:underline">
              Go back and edit
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: Details ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <button onClick={() => setStep("type")} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <ProgressBar current="details" />

        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {userType === "individual" ? "Your details" : "Business details"}
          </h1>
          <span className={`badge ${userType === "individual" ? "tag-blue" : "tag-purple"}`}>
            {userType === "individual" ? "Individual" : "Business"}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ll send an OTP to verify your {userType === "business" ? "phone number" : "contact"}.
        </p>

        {/* Google shortcut */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or fill details</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              {userType === "individual" ? "Full name" : "Contact person name"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* ── Business-only fields ── */}
          {userType === "business" && (
            <>
              {/* Business name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Business name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business / brand name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Business type — visual cards */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">What type of business?</label>
                <TypeGrid
                  types={LIFESTYLE_TYPES}
                  selected={businessType}
                  onSelect={(id) => { setBusinessType(id); setEmergencyPhone(""); }}
                />
                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-red-100" />
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Health</span>
                  <div className="flex-1 h-px bg-red-100" />
                </div>
                <TypeGrid
                  types={HEALTH_TYPES}
                  selected={businessType}
                  onSelect={(id) => { setBusinessType(id); setEmergencyPhone(""); }}
                  healthStyle
                />
              </div>

              {/* Emergency number — hospitals & clinics only */}
              {EMERGENCY_TYPES.has(businessType) && (
                <div className="border border-red-200 bg-red-50 rounded-xl p-3 space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <PhoneCall className="w-3.5 h-3.5" /> Emergency / 24h helpline number
                  </label>
                  <div className="flex">
                    <span className="flex items-center px-3 border border-r-0 border-red-200 rounded-l-lg bg-red-100 text-sm text-red-600 font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Emergency contact number"
                      className="flex-1 px-3 py-2.5 border border-red-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    />
                  </div>
                  <p className="text-xs text-red-500">Displayed prominently on your listing for patients.</p>
                </div>
              )}

              {/* Business hours */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Business hours
                </label>
                <div className="border border-gray-200 rounded-xl p-3 space-y-3">
                  {/* Open / Close time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Opens at</label>
                      <input
                        type="time"
                        value={hoursOpen}
                        onChange={(e) => setHoursOpen(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Closes at</label>
                      <input
                        type="time"
                        value={hoursClose}
                        onChange={(e) => setHoursClose(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  {/* Days open */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Open on</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {DAYS.map((day) => {
                        const active = openDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              active
                                ? "bg-brand-600 text-white border-brand-600"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  GSTIN <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </>
          )}

          {/* Contact method */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              {userType === "individual" ? "Verify via" : "Phone number"}
            </label>

            {userType === "individual" && (
              <div className="flex gap-2 mb-3">
                {(["email", "phone"] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setContactMethod(m)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                      contactMethod === m
                        ? "bg-brand-50 border-brand-400 text-brand-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {m === "email"
                      ? <><Mail className="w-3.5 h-3.5 inline mr-1" />Email</>
                      : <><Phone className="w-3.5 h-3.5 inline mr-1" />Phone</>}
                  </button>
                ))}
              </div>
            )}

            {effectiveContactMethod === "email" ? (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ) : (
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9900000000"
                  required
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Password <span className="font-normal text-gray-400">(optional — or use OTP to login)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> &{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
