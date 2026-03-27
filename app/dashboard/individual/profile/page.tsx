"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, CheckCircle, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function IndividualProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone?.replace("+91", "") ?? "");
  const [location, setLocation] = useState("Neopolis District");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Your personal details and contact preferences.
        </p>
      </div>

      {/* Avatar */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-extrabold text-2xl">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{user?.email ?? user?.phone}</p>
          <span className="tag-blue mt-1">Individual</span>
        </div>
        <button className="ml-auto btn-secondary text-xs py-1.5">
          Change Photo
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Personal Details</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your locality / city"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Contact Information</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Email address
              {user?.email && <span className="ml-2 text-green-600 font-normal"><CheckCircle className="w-3 h-3 inline" /> Verified</span>}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Mobile number
              {user?.phone && <span className="ml-2 text-green-600 font-normal"><CheckCircle className="w-3 h-3 inline" /> Verified</span>}
            </label>
            <div className="flex">
              <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
                <Phone className="w-3.5 h-3.5 mr-1.5" /> +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9900000000"
                className={`${inputClass} rounded-l-none`}
              />
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Security</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Change password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="New password (leave blank to keep current)"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
        </div>

        {saved && (
          <p className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            <CheckCircle className="w-4 h-4" /> Profile saved successfully.
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
