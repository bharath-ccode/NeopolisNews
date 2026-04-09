"use client";

import React, { useState } from "react";
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
  Clock,
  Utensils,
  Film,
  ShoppingBag,
  Scissors,
  Coffee,
  Dumbbell,
  Building2,
  Hospital,
  Pill,
  Stethoscope,
  PhoneCall,
} from "lucide-react";
import { useAuth, BusinessHours } from "@/context/AuthContext";
import Link from "next/link";

type BizType = { id: string; label: string; Icon: React.ComponentType<{ className?: string }>; color: string };

const LIFESTYLE_TYPES: BizType[] = [
  { id: "Restaurant",  label: "Restaurant",    Icon: Utensils,    color: "bg-orange-50 text-orange-600" },
  { id: "Movie Hall",  label: "Movie Hall",    Icon: Film,        color: "bg-purple-50 text-purple-600" },
  { id: "Shop",        label: "Shop / Retail", Icon: ShoppingBag, color: "bg-blue-50 text-blue-600"     },
  { id: "Saloon",      label: "Saloon",        Icon: Scissors,    color: "bg-pink-50 text-pink-600"     },
  { id: "Cafe",        label: "Cafe",          Icon: Coffee,      color: "bg-yellow-50 text-yellow-700" },
  { id: "Fitness",     label: "Fitness & Gym", Icon: Dumbbell,    color: "bg-green-50 text-green-600"   },
  { id: "Other",       label: "Other",         Icon: Building2,   color: "bg-gray-50 text-gray-600"     },
];

const HEALTH_TYPES: BizType[] = [
  { id: "Hospital",  label: "Hospital",  Icon: Hospital,    color: "bg-red-50 text-red-600"   },
  { id: "Pharmacy",  label: "Pharmacy",  Icon: Pill,        color: "bg-teal-50 text-teal-600" },
  { id: "Clinic",    label: "Clinic",    Icon: Stethoscope, color: "bg-cyan-50 text-cyan-600" },
];

const ALL_TYPES: BizType[] = [...LIFESTYLE_TYPES, ...HEALTH_TYPES];
const EMERGENCY_TYPES = new Set(["Hospital", "Clinic"]);

function TypeGrid({
  types,
  selected,
  onSelect,
  healthStyle = false,
}: {
  types: BizType[];
  selected: string;
  onSelect: (id: string) => void;
  healthStyle?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {types.map(({ id, label, Icon, color }) => {
        const sel = selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-center ${
              sel
                ? healthStyle ? "border-red-500 bg-red-50" : "border-brand-500 bg-brand-50"
                : "border-gray-100 hover:border-gray-300 bg-white"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sel ? (healthStyle ? "bg-red-100" : "bg-brand-100") : color}`}>
              <Icon className={`w-4 h-4 ${sel ? (healthStyle ? "text-red-600" : "text-brand-600") : ""}`} />
            </div>
            <span className={`text-xs font-semibold leading-tight ${sel ? (healthStyle ? "text-red-700" : "text-brand-700") : "text-gray-600"}`}>
              {label}
            </span>
            {sel && <CheckCircle className={`w-3.5 h-3.5 ${healthStyle ? "text-red-600" : "text-brand-600"}`} />}
          </button>
        );
      })}
    </div>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_HOURS: BusinessHours = { open: "09:00", close: "21:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };

export default function BusinessProfile() {
  const { user } = useAuth();

  const [contactName, setContactName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [businessType, setBusinessType] = useState(user?.businessType ?? "");
  const [gstin, setGstin] = useState(user?.gstin ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone?.replace("+91", "") ?? "");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("Neopolis District");
  const [about, setAbout] = useState("");

  const initHours = user?.businessHours ?? DEFAULT_HOURS;
  const [hoursOpen, setHoursOpen] = useState(initHours.open);
  const [hoursClose, setHoursClose] = useState(initHours.close);
  const [openDays, setOpenDays] = useState<string[]>(initHours.days);
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyPhone?.replace("+91", "") ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleDay(day: string) {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const selectedType = ALL_TYPES.find((t) => t.id === businessType);
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

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
          <div className="flex items-center gap-2 mt-0.5">
            {selectedType ? (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <selectedType.Icon className="w-3.5 h-3.5" /> {selectedType.label}
              </span>
            ) : (
              <span className="text-xs text-gray-400">No type selected</span>
            )}
          </div>
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

          {/* Business type — visual cards */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Business type</label>
            <TypeGrid
              types={LIFESTYLE_TYPES}
              selected={businessType}
              onSelect={(id) => { setBusinessType(id); setEmergencyPhone(""); }}
            />
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-red-100" />
              <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Health</span>
              <div className="flex-1 h-px bg-red-100" />
            </div>
            <TypeGrid
              types={HEALTH_TYPES}
              selected={businessType}
              onSelect={(id) => { setBusinessType(id); setEmergencyPhone(""); }}
              healthStyle
            />
          </div>

          {/* Emergency number — hospitals & clinics only */}
          {EMERGENCY_TYPES.has(businessType) && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-3 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                <PhoneCall className="w-3.5 h-3.5" /> Emergency / 24h helpline number
              </label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-red-200 rounded-l-lg bg-red-100 text-sm text-red-600 font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Emergency contact number"
                  className="flex-1 px-3 py-2.5 border border-red-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                />
              </div>
              <p className="text-xs text-red-500">Displayed prominently on your listing for patients.</p>
            </div>
          )}

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

        {/* Business hours */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" /> Business Hours
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Opens at</label>
              <input
                type="time"
                value={hoursOpen}
                onChange={(e) => setHoursOpen(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Closes at</label>
              <input
                type="time"
                value={hoursClose}
                onChange={(e) => setHoursClose(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Open on</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day) => {
                const active = openDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      active
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          {openDays.length > 0 && (
            <p className="text-xs text-gray-400">
              Showing as: <span className="font-semibold text-gray-600">{openDays.join(", ")}</span>{" "}
              &middot; {hoursOpen} – {hoursClose}
            </p>
          )}
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
