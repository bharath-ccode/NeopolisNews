"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  CheckCircle,
  ArrowRight,
  Loader2,
  IndianRupee,
  Phone,
  Globe,
} from "lucide-react";

const CLASSIFIED_CATEGORIES = [
  "Office Leasing",
  "Retail Space",
  "Real Estate Project",
  "Restaurant / F&B",
  "Fitness & Wellness",
  "Beauty & Salon",
  "Education & Training",
  "Healthcare",
  "Financial Services",
  "Interior & Fit-Out",
  "IT & Technology",
  "Recruitment & Staffing",
  "Event & Venue",
  "Other Services",
];

const PROMO_PLACEMENTS = [
  { id: "standard", label: "Standard", desc: "Listed in category", price: "Free" },
  { id: "featured", label: "Featured", desc: "Highlighted in category", price: "₹1,000/wk" },
  { id: "homepage", label: "Homepage Spot", desc: "Shown on homepage", price: "₹5,000/wk" },
];

export default function PostBusinessClassified() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("total");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [offerText, setOfferText] = useState("");
  const [placement, setPlacement] = useState("standard");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function addHighlight() {
    const h = newHighlight.trim();
    if (h && highlights.length < 5) {
      setHighlights([...highlights, h]);
      setNewHighlight("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Classified Published!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your classified is now live on NeopolisNews. Leads will start appearing in your dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard/business/classifieds")}
            className="btn-primary text-sm"
          >
            View My Classifieds <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setDone(false); setTitle(""); setDescription(""); }}
            className="btn-secondary text-sm"
          >
            Post Another
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Post a Classified</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Listings, service offers, job postings, events — reach Neopolis residents and businesses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Classified Details</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required className={inputClass}>
              <option value="">Select a category…</option>
              {CLASSIFIED_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title / Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Premium Office Space Available — 2,000 sq ft, Business Park"
              maxLength={100}
              required
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100 characters</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your offering in detail — location, features, terms, and what makes it special…"
              rows={5}
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Pricing</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Price</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 2,80,000"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Price unit</label>
              <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} className={inputClass}>
                <option value="total">Total / One-time</option>
                <option value="per_month">Per Month</option>
                <option value="per_sqft_month">Per sq ft / month</option>
                <option value="per_year">Per Year</option>
                <option value="starting_from">Starting From</option>
                <option value="contact">Contact for Price</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Current Offer <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="e.g. First month free · 20% off for early birds"
              className={inputClass}
            />
          </div>
        </div>

        {/* Highlights */}
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-sm text-gray-900">
            Key Highlights <span className="font-normal text-gray-400 text-xs">(up to 5)</span>
          </h3>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <span className="flex-1 text-gray-700">{h}</span>
                <button
                  type="button"
                  onClick={() => setHighlights(highlights.filter((_, j) => j !== i))}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {highlights.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                placeholder="e.g. LEED Gold certified building"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addHighlight}
                className="btn-secondary text-sm py-2"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Media */}
        <div className="card p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Photos / Videos</h3>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 text-gray-400 hover:border-brand-300 transition-colors cursor-pointer">
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium">Upload photos or videos</p>
            <p className="text-xs">JPG, PNG, MP4 · Up to 50MB</p>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-sm text-gray-900">Contact & Links</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact phone</label>
            <div className="flex">
              <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
                <Phone className="w-3.5 h-3.5 mr-1" />+91
              </span>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9900000000"
                required
                className={`${inputClass} rounded-l-none`}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Website / link <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>

        {/* Placement */}
        <div className="card p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Placement</h3>
          <div className="space-y-2">
            {PROMO_PLACEMENTS.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  placement === p.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="placement"
                  value={p.id}
                  checked={placement === p.id}
                  onChange={() => setPlacement(p.id)}
                  className="accent-brand-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </div>
                <span className="text-sm font-bold text-brand-700">{p.price}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {loading ? "Publishing…" : "Publish Classified"}
        </button>
      </form>
    </div>
  );
}
