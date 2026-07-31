"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result === "ok") {
        router.push("/admin");
        router.refresh();
      } else if (result === "invalid_credentials") {
        setError("Invalid email or password. Please try again.");
      } else if (result === "not_admin") {
        setError("This account is registered as a builder. Use the Builder Portal to sign in.");
      } else if (result === "timeout") {
        setError("Connection timed out. The Supabase project may be paused — restore it at supabase.com/dashboard and try again.");
      } else {
        setError("Login failed. Check your credentials or that your admin account exists in Supabase.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-brand-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Neopolis<span className="text-brand-400">News</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-6">
            Access the admin dashboard to manage news and analytics.
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@neopolisnews.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {loading ? "Signing in…" : "Sign in to Admin"}
            </button>
          </form>

        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Not an admin?{" "}
          <a href="/" className="text-brand-400 hover:underline">
            Go to website
          </a>
        </p>
      </div>
    </div>
  );
}
