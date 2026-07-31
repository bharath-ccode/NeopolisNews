"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

export default function MyBusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.includes("@")) return setError("Please enter a valid email address.");
    if (!password) return setError("Please enter your password.");
    setError(""); setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Incorrect email or password. Please try again.");
        return;
      }
      router.push("/my-business");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
            <span className="text-gray-400 font-normal"> · My Business</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="card p-8">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
              <Building2 className="w-7 h-7 text-brand-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Sign in to My Business</h1>
            <p className="text-sm text-gray-500 mb-6">
              Manage your business listing on NeopolisNews.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={LABEL}><Mail className="w-3.5 h-3.5 inline mr-1" />Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={INPUT}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div>
                <label className={LABEL}><Lock className="w-3.5 h-3.5 inline mr-1" />Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={INPUT}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full justify-center mt-6"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-5">
              Don&apos;t have a listing yet?{" "}
              <Link href="/register-business" className="text-brand-600 hover:underline">
                Register your business
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
