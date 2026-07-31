"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Building2, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Info } from "lucide-react";

export default function BrokerRegisterPage() {
  const [name,        setName]        = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [reraNumber,  setReraNumber]  = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [done,        setDone]        = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/broker/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, companyName, phone, email, reraNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your broker account is under review. You'll be notified once admin approves it —
            usually within 24 hours. Then you can log in and start posting listings.
          </p>
          <Link href="/broker/login" className="btn-primary text-sm justify-center w-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-900 leading-tight">
              Neopolis<span className="text-brand-600">News</span>
            </p>
            <p className="text-xs text-gray-400">Broker Registration</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Register as Broker</h1>
          <p className="text-sm text-gray-500 mb-4">
            Once approved, you can post and manage property listings on NeopolisNews.
          </p>

          {/* Important notice */}
          <div className="flex items-start gap-2 bg-brand-50 border border-brand-100 text-brand-800 text-xs rounded-lg px-3 py-2.5 mb-5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-brand-600" />
            Use an email address that is <strong>not</strong> registered anywhere else on
            NeopolisNews. Broker accounts must be kept separate.
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company / Agency Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputCls}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="10-digit number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  RERA Number
                </label>
                <input
                  type="text"
                  value={reraNumber}
                  onChange={(e) => setReraNumber(e.target.value)}
                  className={inputCls}
                  placeholder="Optional"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="broker@youragency.com"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls + " pr-10"}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
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

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className={inputCls}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Application
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Already registered?{" "}
          <Link href="/broker/login" className="underline hover:text-gray-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
