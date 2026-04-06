"use client";

import { useState, FormEvent } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminSettingsPage() {
  const { admin, changePassword } = useAdminAuth();

  const [currentPwd, setCurrentPwd]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPwd.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("New passwords do not match.");
      return;
    }
    if (currentPwd === newPwd) {
      setError("New password must be different from the current password.");
      return;
    }

    setSaving(true);
    try {
      const result = await changePassword(currentPwd, newPwd);
      if (result === "wrong_current") {
        setError("Current password is incorrect.");
      } else {
        setSuccess(true);
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  // Password strength indicator
  function strength(pwd: string) {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8)   score++;
    if (pwd.length >= 12)  score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }

  const pwdStrength = strength(newPwd);
  const strengthLabel  = ["", "Weak", "Fair", "Good", "Strong", "Very strong"][pwdStrength];
  const strengthColor  = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-600"][pwdStrength];
  const strengthText   = ["", "text-red-600", "text-orange-600", "text-yellow-600", "text-green-600", "text-green-700"][pwdStrength];

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage your admin account security.
        </p>
      </div>

      {/* Account info */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          A
        </div>
        <div>
          <p className="font-semibold text-gray-900">{admin?.name ?? "Admin"}</p>
          <p className="text-sm text-gray-500">{admin?.email}</p>
          <span className="badge bg-green-100 text-green-700 text-xs mt-1">
            <ShieldCheck className="w-3 h-3" /> Administrator
          </span>
        </div>
      </div>

      {/* Password change */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-gray-900">Change Password</h3>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Password updated successfully. Use your new password on next login.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Enter current password"
                className={`${inputCls} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPwd}
                onChange={(e) => { setNewPwd(e.target.value); setSuccess(false); }}
                placeholder="Min. 8 characters"
                className={`${inputCls} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {newPwd.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${
                        i <= pwdStrength ? strengthColor : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strengthText}`}>
                  {strengthLabel}
                </p>
              </div>
            )}

            <ul className="mt-2 space-y-0.5 text-xs text-gray-400">
              <li className={newPwd.length >= 8 ? "text-green-600" : ""}>
                {newPwd.length >= 8 ? "✓" : "·"} At least 8 characters
              </li>
              <li className={/[A-Z]/.test(newPwd) ? "text-green-600" : ""}>
                {/[A-Z]/.test(newPwd) ? "✓" : "·"} One uppercase letter
              </li>
              <li className={/[0-9]/.test(newPwd) ? "text-green-600" : ""}>
                {/[0-9]/.test(newPwd) ? "✓" : "·"} One number
              </li>
              <li className={/[^A-Za-z0-9]/.test(newPwd) ? "text-green-600" : ""}>
                {/[^A-Za-z0-9]/.test(newPwd) ? "✓" : "·"} One special character
              </li>
            </ul>
          </div>

          {/* Confirm new password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Re-enter new password"
                className={`${inputCls} pl-10 pr-10 ${
                  confirmPwd && confirmPwd !== newPwd
                    ? "border-red-300 focus:ring-red-400"
                    : confirmPwd && confirmPwd === newPwd
                    ? "border-green-300 focus:ring-green-400"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPwd && confirmPwd !== newPwd && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            {confirmPwd && confirmPwd === newPwd && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            {saving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Production migration note */}
      <div className="card p-5 border-orange-100 bg-orange-50">
        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">
          Dev mode — localStorage only
        </p>
        <p className="text-xs text-orange-700 leading-relaxed">
          Passwords are currently stored in browser localStorage. This is suitable
          for local development only. See the production migration guide to move to
          a real backend with hashed credentials.
        </p>
      </div>
    </div>
  );
}
