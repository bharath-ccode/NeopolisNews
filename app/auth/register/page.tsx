"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Briefcase,
  MailCheck,
} from "lucide-react";
import { useAuth, UserType } from "@/context/AuthContext";

type Step = "type" | "details" | "done";

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
  const steps: Step[] = ["type", "details", "done"];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, idx) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            s === current ? "bg-brand-600 text-white" : steps.indexOf(current) > idx ? "bg-brand-200 text-brand-700" : "bg-gray-100 text-gray-400"
          }`}>
            {steps.indexOf(current) > idx ? <CheckCircle className="w-4 h-4" /> : idx + 1}
          </div>
          {idx < 2 && <div className="h-px w-8 bg-gray-200" />}
        </div>
      ))}
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, loginWithGoogle } = useAuth();

  const [step, setStep] = useState<Step>("type");
  const [userType, setUserType] = useState<UserType>("individual");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading(true);
    await loginWithGoogle(userType);
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email) { setError("Please enter your email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await signUp(email, password, name.trim());
      setStep("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg.toLowerCase().includes("already registered")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

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
                <p className="text-xs text-gray-400 mt-0.5">Resident / buyer / tenant</p>
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
                <p className="text-xs text-gray-400 mt-0.5">Restaurant / shop / salon…</p>
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

          <button
            onClick={() => {
              if (userType === "business") {
                router.push("/register-business");
              } else {
                setStep("details");
              }
            }}
            className="btn-primary w-full justify-center"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: Done — check your email ───────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <Logo />
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-2">
            We sent a verification link to
          </p>
          <p className="font-semibold text-gray-800 mb-6">{email}</p>
          <p className="text-sm text-gray-400 mb-8">
            Click the link in the email to verify your account and sign in.
            The link expires in 24 hours.
          </p>
          <div className="space-y-3">
            <Link href="/auth/login" className="btn-primary w-full justify-center">
              Go to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-gray-400">
              Wrong email?{" "}
              <button
                onClick={() => { setStep("details"); setError(""); }}
                className="text-brand-600 font-semibold hover:underline"
              >
                Go back and change it
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Details ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <button onClick={() => { setStep("type"); setError(""); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <ProgressBar current="details" />

        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Your details</h1>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ll send a verification link to your email.
        </p>

        {/* Google shortcut */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors mb-4 disabled:opacity-60"
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
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full name</label>
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

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email address</label>
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
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!!confirmPassword && confirmPassword !== password)}
            className="btn-primary w-full justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Creating account…" : "Create Account"}
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
