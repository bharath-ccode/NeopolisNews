"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useAuth, UserType } from "@/context/AuthContext";

type Method = "google" | "email" | "phone";
type EmailMode = "password" | "otp";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const { loginWithGoogle, loginWithEmail, loginWithOtp, sendOtp } = useAuth();

  const [method, setMethod] = useState<Method>("email");
  const [emailMode, setEmailMode] = useState<EmailMode>("password");
  const [userType, setUserType] = useState<UserType>("individual");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp() {
    const contact = method === "email" ? email : phone;
    if (!contact) { setError("Please enter your email / phone first."); return; }
    setError("");
    setLoading(true);
    await sendOtp(contact);
    setOtpSent(true);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (method === "email") {
        if (emailMode === "password") {
          await loginWithEmail(email, password, userType);
        } else {
          await loginWithOtp(email, otp, userType);
        }
      } else {
        await loginWithOtp(phone, otp, userType);
      }
      router.push(redirectTo);
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await loginWithGoogle(userType);
    router.push(redirectTo);
  }

  const TAB = "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors";
  const TAB_ACTIVE = `${TAB} bg-white text-brand-700 shadow-sm`;
  const TAB_IDLE = `${TAB} text-gray-500 hover:text-gray-700`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">
          Neopolis<span className="text-brand-600">News</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-brand-600 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>

        {/* User type toggle */}
        <div className="flex gap-2 mb-5">
          {(["individual", "business"] as UserType[]).map((t) => (
            <button
              key={t}
              onClick={() => setUserType(t)}
              className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                userType === t
                  ? "bg-brand-50 border-brand-500 text-brand-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {t === "individual" ? "Individual" : "Business"}
            </button>
          ))}
        </div>

        {/* Google */}
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

        <div className="relative flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Method tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
          <button onClick={() => { setMethod("email"); setOtpSent(false); }} className={method === "email" ? TAB_ACTIVE : TAB_IDLE}>
            <Mail className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Email
          </button>
          <button onClick={() => { setMethod("phone"); setOtpSent(false); }} className={method === "phone" ? TAB_ACTIVE : TAB_IDLE}>
            <Phone className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Phone
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === "email" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          )}

          {method === "phone" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mobile number</label>
              <div className="relative flex">
                <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">+91</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9900000000" maxLength={10} required className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          )}

          {method === "email" && (
            <div className="flex gap-3">
              {(["password", "otp"] as EmailMode[]).map((m) => (
                <button type="button" key={m} onClick={() => { setEmailMode(m); setOtpSent(false); setOtp(""); }}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${emailMode === m ? "bg-brand-50 border-brand-400 text-brand-700" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                  {m === "password" ? <><Lock className="w-3.5 h-3.5 inline mr-1" />Use password</> : <><MessageSquare className="w-3.5 h-3.5 inline mr-1" />Use OTP</>}
                </button>
              ))}
            </div>
          )}

          {method === "email" && emailMode === "password" && (
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-500">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {(method === "phone" || (method === "email" && emailMode === "otp")) && (
            <div>
              {!otpSent ? (
                <button type="button" onClick={handleSendOtp} disabled={loading} className="w-full btn-secondary justify-center text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Send OTP
                </button>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">OTP sent to {method === "phone" ? `+91 ${phone}` : email}</label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit OTP" maxLength={6} required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <button type="button" onClick={handleSendOtp} className="text-xs text-brand-600 hover:underline mt-1.5 block">Resend OTP</button>
                </div>
              )}
            </div>
          )}

          {((method === "email" && emailMode === "password") || otpSent) && (
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          )}
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          By signing in, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
