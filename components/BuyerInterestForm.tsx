"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2, Info } from "lucide-react";
import { LOCALITIES } from "@/lib/projectsStore";

const PROPERTY_TYPES = [
  { id: "apartment", label: "Apartment" },
  { id: "villa", label: "Villa" },
] as const;

const BEDROOMS = Array.from({ length: 10 }, (_, i) => i + 1);

const TIERS = [
  { id: "affordable", label: "Affordable", hint: "Typically under ₹75 lakh" },
  { id: "premium", label: "Premium", hint: "Typically ₹75 lakh – ₹1.5 Cr" },
  { id: "luxury", label: "Luxury", hint: "Typically ₹1.5 Cr – ₹3 Cr" },
  { id: "uber_luxury", label: "Uber Luxury", hint: "Typically ₹3 Cr+" },
] as const;

const MAX_AREAS = 3;

/** "Express Interest" on /real-estate — captures prospective buyers
 *  actively shopping for a home (not tied to any one project), so the
 *  platform builds a list of real demand by area/budget/configuration. */
export default function BuyerInterestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [propertyType, setPropertyType] = useState<"apartment" | "villa" | "">("");
  const [bedrooms, setBedrooms] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [tiers, setTiers] = useState<string[]>([]);

  function toggleArea(area: string) {
    setAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : prev.length < MAX_AREAS ? [...prev, area] : prev
    );
  }

  function toggleTier(tier: string) {
    setTiers((prev) => (prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyType) { setError("Select apartment or villa."); return; }
    if (!bedrooms) { setError("Select a bedroom count."); return; }
    if (areas.length === 0) { setError("Select at least one area."); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/real-estate/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, propertyType, bedrooms, areas, tiers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      active
        ? "bg-brand-600 text-white border-brand-600"
        : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
    }`;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="font-semibold text-lg text-gray-900">Thanks for sharing!</p>
        <p className="text-sm text-gray-500">
          We&apos;ll reach out as matching projects become available.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Looking to Buy?</h3>
      <p className="text-sm text-gray-500 mb-4">
        Tell us what you&apos;re looking for — we&apos;ll notify you when a matching project lists.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className={inputClass}
          placeholder="Your name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className={inputClass}
            placeholder="Mobile number *"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            className={inputClass}
            placeholder="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex gap-2">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPropertyType(t.id)}
                className={pillClass(propertyType === t.id) + " flex-1"}
              >
                {t.label}
              </button>
            ))}
          </div>
          <select
            className={inputClass}
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            required
          >
            <option value="" disabled>Bedrooms *</option>
            {BEDROOMS.map((n) => (
              <option key={n} value={n}>{n} BHK</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">
            Area — pick up to {MAX_AREAS} *
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LOCALITIES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => toggleArea(loc)}
                disabled={!areas.includes(loc) && areas.length >= MAX_AREAS}
                className={pillClass(areas.includes(loc)) + " disabled:opacity-40 disabled:cursor-not-allowed"}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
            Budget tier (optional)
            <span className="group relative inline-flex">
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-56 text-[11px] font-normal normal-case bg-gray-900 text-white rounded-lg p-2.5 z-10 leading-snug">
                Indicative only — exact pricing varies by project.{" "}
                {TIERS.map((t) => `${t.label}: ${t.hint}`).join(". ")}.
              </span>
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTier(t.id)}
                className={pillClass(tiers.includes(t.id))}
                title={t.hint}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Sending…" : "Express Interest"}
        </button>
        <p className="text-xs text-center text-gray-400">
          By submitting, you agree to our privacy policy. No spam, ever.
        </p>
      </form>
    </div>
  );
}
