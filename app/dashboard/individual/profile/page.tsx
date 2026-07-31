"use client";

import { useState } from "react";
import {
  User, Mail, Phone, MapPin, CheckCircle, Loader2,
  Lock, Eye, EyeOff, AtSign, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const GENDER_OPTIONS = [
  { value: "male",              label: "Male" },
  { value: "female",            label: "Female" },
  { value: "non_binary",        label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function SectionStatus({ saving, saved, error }: { saving: boolean; saved: boolean; error: string }) {
  if (saving) return null;
  if (error) return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>;
  if (saved) return (
    <p className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
      <CheckCircle className="w-4 h-4" /> Saved
    </p>
  );
  return null;
}

const inputClass =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function IndividualProfile() {
  const { user, updateProfile, changePassword } = useAuth();

  // ── Forum Identity ──────────────────────────────────────────────────────────
  const [screenName, setScreenName] = useState(user?.screen_name ?? "");
  const [idSaving, setIdSaving]     = useState(false);
  const [idSaved,  setIdSaved]      = useState(false);
  const [idError,  setIdError]      = useState("");

  async function saveIdentity(e: React.FormEvent) {
    e.preventDefault();
    setIdError(""); setIdSaved(false);
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(screenName.trim())) {
      setIdError("Screen name must be 3–20 characters: letters, numbers and underscores only.");
      return;
    }
    setIdSaving(true);
    try {
      await updateProfile({ screen_name: screenName.trim() });
      setIdSaved(true);
      setTimeout(() => setIdSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed.";
      setIdError(msg.includes("unique") || msg.includes("duplicate")
        ? "That screen name is already taken. Please choose another."
        : msg);
    } finally {
      setIdSaving(false);
    }
  }

  // ── Personal Details ────────────────────────────────────────────────────────
  const [name,         setName]         = useState(user?.name ?? "");
  const [age,          setAge]          = useState(user?.age ? String(user.age) : "");
  const [gender,       setGender]       = useState(user?.gender ?? "");
  const [location,     setLocation]     = useState(user?.location ?? "");
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailSaved,  setDetailSaved]  = useState(false);
  const [detailError,  setDetailError]  = useState("");

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setDetailError(""); setDetailSaved(false);
    if (!name.trim()) { setDetailError("Full name cannot be blank."); return; }
    if (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      setDetailError("Please enter a valid age."); return;
    }
    if (!gender) { setDetailError("Please select your gender."); return; }
    setDetailSaving(true);
    try {
      await updateProfile({ name: name.trim(), age: Number(age), gender, location: location.trim() || undefined });
      setDetailSaved(true);
      setTimeout(() => setDetailSaved(false), 3000);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setDetailSaving(false);
    }
  }

  // ── Contact ─────────────────────────────────────────────────────────────────
  const [phone,          setPhone]          = useState(user?.phone?.replace("+91", "") ?? "");
  const [contactSaving,  setContactSaving]  = useState(false);
  const [contactSaved,   setContactSaved]   = useState(false);
  const [contactError,   setContactError]   = useState("");

  async function saveContact(e: React.FormEvent) {
    e.preventDefault();
    setContactError(""); setContactSaved(false);
    setContactSaving(true);
    try {
      await updateProfile({ phone: phone ? `+91${phone}` : undefined });
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 3000);
    } catch (err: unknown) {
      setContactError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setContactSaving(false);
    }
  }

  // ── Security ────────────────────────────────────────────────────────────────
  const [newPassword,  setNewPassword]  = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwSaving,     setPwSaving]     = useState(false);
  const [pwSaved,      setPwSaved]      = useState(false);
  const [pwError,      setPwError]      = useState("");

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSaved(false);
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    try {
      await changePassword(newPassword);
      setNewPassword("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setPwSaving(false);
    }
  }

  const displayName = screenName || name || "U";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-400 mt-0.5">Your personal details and community identity.</p>
      </div>

      {/* Avatar card */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-extrabold text-2xl shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-900">{name || "—"}</p>
          {screenName && <p className="text-sm text-brand-600 font-semibold">@{screenName}</p>}
          <p className="text-xs text-gray-400">{user?.email ?? user?.phone}</p>
          <span className="tag-blue mt-1 inline-block">Individual</span>
        </div>
      </div>

      {/* ── Forum Identity ─────────────────────────────────────────────── */}
      <form onSubmit={saveIdentity} className="card p-5 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-gray-900">Forum Identity</h3>
          <p className="text-xs text-gray-400 mt-0.5">How you appear in community discussions and reviews.</p>
        </div>

        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span className="text-amber-800">
            Your <strong>screen name</strong> is the only name others ever see — your real name stays private.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Screen name <span className="text-red-500">*</span>
            <span className="ml-1.5 font-normal text-gray-400">3–20 chars · letters, numbers, underscores</span>
          </label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={screenName}
              onChange={e => setScreenName(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
              placeholder="e.g. neopolis_resident"
              required
              className={`${inputClass} pl-10`}
            />
          </div>
          {screenName && (
            <p className="text-xs text-brand-600 mt-1">
              You will appear as <strong>@{screenName}</strong> in forum posts and reviews.
            </p>
          )}
        </div>

        <SectionStatus saving={idSaving} saved={idSaved} error={idError} />

        <button type="submit" disabled={idSaving} className="btn-primary text-sm">
          {idSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {idSaving ? "Saving…" : "Save Screen Name"}
        </button>
      </form>

      {/* ── Personal Details ───────────────────────────────────────────── */}
      <form onSubmit={saveDetails} className="card p-5 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-gray-900">Personal Details</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kept private — used for community analytics only.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Full name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 34"
              min={1}
              max={120}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">— Select —</option>
              {GENDER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Location <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Your locality / city"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <SectionStatus saving={detailSaving} saved={detailSaved} error={detailError} />

        <button type="submit" disabled={detailSaving} className="btn-primary text-sm">
          {detailSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {detailSaving ? "Saving…" : "Save Personal Details"}
        </button>
      </form>

      {/* ── Contact Information ────────────────────────────────────────── */}
      <form onSubmit={saveContact} className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-gray-900">Contact Information</h3>

        {user?.email && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Email address
              <span className="ml-2 text-green-600 font-normal">
                <CheckCircle className="w-3 h-3 inline" /> Verified
              </span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={user.email}
                disabled
                className={`${inputClass} pl-10 bg-gray-50 text-gray-400 cursor-not-allowed`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Managed by your sign-in provider — cannot be changed here.</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Mobile number
            {user?.phone && (
              <span className="ml-2 text-green-600 font-normal">
                <CheckCircle className="w-3 h-3 inline" /> Verified
              </span>
            )}
          </label>
          <div className="flex">
            <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
              <Phone className="w-3.5 h-3.5 mr-1.5" /> +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9900000000"
              className={`${inputClass} rounded-l-none`}
            />
          </div>
        </div>

        <SectionStatus saving={contactSaving} saved={contactSaved} error={contactError} />

        <button type="submit" disabled={contactSaving} className="btn-primary text-sm">
          {contactSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {contactSaving ? "Saving…" : "Save Contact"}
        </button>
      </form>

      {/* ── Security ──────────────────────────────────────────────────── */}
      <form onSubmit={savePassword} className="card p-5 space-y-4">
        <h3 className="font-bold text-sm text-gray-900">Security</h3>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            New password <span className="font-normal text-gray-400">— min 8 characters</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className={`${inputClass} pl-10 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <SectionStatus saving={pwSaving} saved={pwSaved} error={pwError} />

        <button type="submit" disabled={pwSaving || !newPassword} className="btn-primary text-sm">
          {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {pwSaving ? "Updating…" : "Change Password"}
        </button>
      </form>
    </div>
  );
}
