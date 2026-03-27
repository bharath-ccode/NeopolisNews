"use client";

import { useState } from "react";
import {
  Briefcase,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
  Loader2,
  Lock,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const BUSINESS_CATEGORIES = [
  "Real Estate Developer", "Property Broker / Agent",
  "Interior Design & Fit-Out", "Retail / Fashion", "Restaurant / F&B",
  "Fitness & Wellness", "IT / Corporate", "Healthcare",
  "Education", "Financial Services", "Legal Services", "Other",
];

export default function BusinessProfile() {
  const { user } = useAuth();

  const [contactName, setContactName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [category, setCategory] = useState(user?.businessCategory ?? "");
  const [gstin, setGstin] = useState(user?.gstin ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone?.replace("+91", "") ?? "");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("Neopolis District");
  const [about, setAbout] = useState("");
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
        <h2 className="text-xl font-extrabold text-gray-900">Business Profile</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          This profile is shown to buyers, tenants, and customers on NeopolisNews.
        </p>
      </div>

      {/* Logo / banner */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-extrabold text-2xl">
          {(businessName || user?.name || "B").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{businessName || user?.name}</p>
          <p className="text-xs text-gray-400">{category || user?.businessCategory}</p>
          <span className="tag-purple mt-1">Business Account</span>
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn-secondary text-xs py-1.5">Upload Logo</button>
          <button className="btn-secondary text-xs py-1.5">Add Banner</button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Business info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Business Information</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Business / Brand name</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="">Select…</option>
              {BUSINESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">About your business</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Describe what you do, your specialisation, and why customers should choose you…"
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              GSTIN <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className={`${inputClass} pl-10 font-mono`}
              />
            </div>
            {gstin.length === 15 && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> GSTIN format valid
              </p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Contact Information</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact person name</label>
            <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Email
                {user?.email && <span className="ml-1 text-green-600 text-xs"><CheckCircle className="w-3 h-3 inline" /> Verified</span>}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Phone
                {user?.phone && <span className="ml-1 text-green-600 text-xs"><CheckCircle className="w-3 h-3 inline" /> Verified</span>}
              </label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
                  <Phone className="w-3.5 h-3.5 mr-1" />+91
                </span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className={`${inputClass} rounded-l-none`} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Address in Neopolis</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputClass} pl-10`} />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Security</h3>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="password" placeholder="New password (leave blank to keep current)" className={`${inputClass} pl-10`} />
          </div>
        </div>

        {/* Upgrade note */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-purple-900">Get a Verified Business Badge</p>
            <p className="text-xs text-purple-700 mt-0.5">Upload your business documents to earn the verified badge — shown on all your listings.</p>
          </div>
          <Link href="/advertise" className="btn-secondary text-xs py-2 shrink-0 border-purple-400 text-purple-700 hover:bg-purple-100">
            Learn more
          </Link>
        </div>

        {saved && (
          <p className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            <CheckCircle className="w-4 h-4" /> Profile saved successfully.
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
