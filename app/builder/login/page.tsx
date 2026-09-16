"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { createClient } from "@/lib/supabase/client";

export default function BuilderLoginPage() {
  const { login } = useBuilderAuth();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Forgot password state
  const [forgotMode, setForgotMode]   = useState(false);
  const [resetEmail, setResetEmail]   = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent]     = useState(false);
  const [resetError, setResetError]   = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return;
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result === "ok") {
      router.push("/builder");
    } else if (result === "not_builder") {
      setError("No builder account found for this email. Contact the admin.");
    } else if (result === "invalid_credentials") {
      setError("Invalid email or password.");
    } else {
      setError("Something went wrong. Please try again.");
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setResetError("");
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/builder/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setResetLoading(false);
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-900 leading-tight">
              Neopolis<span className="text-brand-600">News</span>
            </p>
            <p className="text-xs text-gray-400">Builder Portal</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          {forgotMode ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h1>
              <p className="text-sm text-gray-500 mb-6">
                Enter your builder account email and we&apos;ll send a reset link.
              </p>

              {resetSent ? (
                <div className="flex items-start gap-2 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-3 py-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Reset link sent to <strong>{resetEmail}</strong>. Check your inbox and follow the link to set a new password.
                  </span>
                </div>
              ) : (
                <>
                  {resetError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {resetError}
                    </div>
                  )}
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        autoComplete="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className={inputCls}
                        placeholder="you@builderco.com"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="btn-primary w-full justify-center disabled:opacity-60"
                    >
                      {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Send Reset Link
                    </button>
                  </form>
                </>
              )}

              <button
                type="button"
                onClick={() => { setForgotMode(false); setResetSent(false); setResetError(""); }}
                className="mt-4 text-sm text-brand-600 hover:underline w-full text-center"
              >
                Back to Sign In
              </button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Builder Sign In</h1>
              <p className="text-sm text-gray-500 mb-6">
                Access your project dashboard and post updates.
              </p>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="you@builderco.com"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setResetEmail(email); }}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputCls + " pr-10"}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign In
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Account issues? Contact{" "}
          <a href="mailto:support@neopolis.news" className="underline hover:text-gray-600">
            support@neopolis.news
          </a>
        </p>
      </div>
    </div>
  );
}
