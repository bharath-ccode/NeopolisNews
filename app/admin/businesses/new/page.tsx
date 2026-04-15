"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Copy,
  ExternalLink,
  Phone,
  MapPin,
  Mail,
  ChevronRight,
} from "lucide-react";
import {
  getIndustries,
  getTypes,
  getSubtypesByTypes,
} from "@/lib/businessDirectory";
import { createBusiness, type BusinessRecord } from "@/lib/businessStore";

type Step = 1 | 2 | 3;

const INPUT =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";

const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

// ─── Checkbox chip ────────────────────────────────────────────────────────────

function Chip({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
        checked
          ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold"
          : "border-gray-200 text-gray-600 hover:border-gray-300"
      }`}
    >
      <span
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? "bg-brand-600 border-brand-600" : "border-gray-300"
        }`}
      >
        {checked && <CheckCircle className="w-3 h-3 text-white" />}
      </span>
      {label}
    </button>
  );
}

// ─── Step dots ────────────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  const steps = ["Business Info", "Contact", "Done"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                done
                  ? "bg-brand-600 border-brand-600 text-white"
                  : active
                  ? "border-brand-600 text-brand-600 bg-white"
                  : "border-gray-200 text-gray-300 bg-white"
              }`}
            >
              {done ? <CheckCircle className="w-3.5 h-3.5" /> : n}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:block ${
                active ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminNewBusinessPage() {
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");

  // Step 1
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);

  // Step 2
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Done
  const [created, setCreated] = useState<BusinessRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Taxonomy helpers ──────────────────────────────────────────────────────

  const allTypes = industry ? getTypes(industry) : [];

  // Grouped subtypes only for currently selected types
  const subtypeGroups = industry
    ? getSubtypesByTypes(industry, selectedTypes)
    : {};

  function handleIndustryChange(val: string) {
    setIndustry(val);
    setSelectedTypes([]);
    setSelectedSubtypes([]);
  }

  function toggleType(t: string) {
    setSelectedTypes((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      // Drop any subtypes that no longer have a parent type selected
      const newGroups = getSubtypesByTypes(industry, next);
      const validSubs = Object.values(newGroups).flat();
      setSelectedSubtypes((subs) => subs.filter((s) => validSubs.includes(s)));
      return next;
    });
  }

  function toggleSubtype(s: string) {
    setSelectedSubtypes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validateStep1() {
    if (!name.trim()) return "Please enter the business name.";
    if (!industry) return "Please select an industry.";
    if (selectedTypes.length === 0) return "Please select at least one type.";
    return "";
  }

  function validateStep2() {
    if (!address.trim()) return "Please enter the address.";
    if (phone.length < 10) return "Please enter a valid 10-digit phone number.";
    return "";
  }

  function goToStep2() {
    const e = validateStep1();
    if (e) { setError(e); return; }
    setError("");
    setStep(2);
  }

  function handleCreate() {
    const e = validateStep2();
    if (e) { setError(e); return; }
    setError("");
    const record = createBusiness({
      name: name.trim(),
      industry,
      types: selectedTypes,
      subtypes: selectedSubtypes,
      address: address.trim(),
      phone: `+91${phone}`,
      email: email.trim() || undefined,
    });
    setCreated(record);
    setStep(3);
  }

  function inviteLink() {
    return typeof window !== "undefined"
      ? `${window.location.origin}/onboard/${created?.id}`
      : "";
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setStep(1); setError("");
    setName(""); setIndustry(""); setSelectedTypes([]); setSelectedSubtypes([]);
    setAddress(""); setPhone(""); setEmail(""); setCreated(null);
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/admin/businesses" className="hover:text-brand-600">
              Businesses
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-semibold">Add Business</span>
          </nav>
        </div>
        <Link
          href="/admin/businesses"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </header>

      <div className="max-w-xl mx-auto px-4 py-10">
        {step < 3 && <StepDots current={step} />}

        {/* ── STEP 1: Business Info ─────────────────────────────────── */}
        {step === 1 && (
          <div className="card p-6">
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">
              Business Information
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Name the business, choose its industry, types, and what it offers.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className={LABEL}>Business Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Brew & Play"
                  className={INPUT}
                />
              </div>

              {/* Industry */}
              <div>
                <label className={LABEL}>Industry</label>
                <select
                  value={industry}
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  className={INPUT}
                >
                  <option value="">Select industry…</option>
                  {getIndustries().map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              {/* Types — multi-select chips */}
              {industry && (
                <div>
                  <label className={LABEL}>
                    Types{" "}
                    <span className="font-normal text-gray-400">
                      (select all that apply)
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {allTypes.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        checked={selectedTypes.includes(t)}
                        onClick={() => toggleType(t)}
                      />
                    ))}
                  </div>
                  {selectedTypes.length > 0 && (
                    <p className="text-xs text-brand-600 mt-2">
                      {selectedTypes.length} selected:{" "}
                      {selectedTypes.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Subtypes — grouped by each selected type */}
              {selectedTypes.length > 0 &&
                Object.entries(subtypeGroups).map(([typeName, subs]) => (
                  <div key={typeName}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-gray-100" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
                        {typeName}
                      </span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {subs.map((s) => (
                        <Chip
                          key={s}
                          label={s}
                          checked={selectedSubtypes.includes(s)}
                          onClick={() => toggleSubtype(s)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

              {selectedSubtypes.length > 0 && (
                <div className="bg-brand-50 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-brand-700 mb-1">
                    Selected offerings ({selectedSubtypes.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSubtypes.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-white border border-brand-200 text-brand-700 px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={goToStep2}
              className="btn-primary w-full justify-center mt-6"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Contact Details ───────────────────────────────── */}
        {step === 2 && (
          <div className="card p-6">
            <button
              onClick={() => { setError(""); setStep(1); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h1 className="text-xl font-extrabold text-gray-900 mb-1">
              Contact Details
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              The owner will claim this listing via OTP on the registered phone
              number.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="space-y-5">
              {/* Address */}
              <div>
                <label className={LABEL}>
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Unit / shop, building, street, area, city — PIN"
                  rows={3}
                  className={INPUT + " resize-none"}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={LABEL}>
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  Phone Number{" "}
                  <span className="font-normal text-gray-400">
                    — owner claims via OTP on this number
                  </span>
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="9900000000"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Email optional */}
              <div>
                <label className={LABEL}>
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email Address{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className={INPUT}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-5 bg-gray-50 rounded-xl px-4 py-3 text-xs space-y-1">
              <p className="font-bold text-gray-800 text-sm">{name}</p>
              <p className="text-gray-500">{industry}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedTypes.map((t) => (
                  <span key={t} className="tag-blue">{t}</span>
                ))}
              </div>
              {selectedSubtypes.length > 0 && (
                <p className="text-gray-400">{selectedSubtypes.join(" · ")}</p>
              )}
            </div>

            <button
              onClick={handleCreate}
              className="btn-primary w-full justify-center mt-5"
            >
              Create &amp; Generate Invite Link{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 3: Done ─────────────────────────────────────────── */}
        {step === 3 && created && (
          <div className="card p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">
              Business Created!
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Share the invite link with{" "}
              <strong>{created.name}</strong>. They can claim it using{" "}
              <strong>{created.phone}</strong> via OTP.
            </p>

            {/* Invite link */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-xs text-brand-600 font-semibold mb-1.5">
                Invite Link
              </p>
              <p className="text-xs font-mono text-brand-800 break-all mb-3">
                {inviteLink()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  {copied ? (
                    <><CheckCircle className="w-4 h-4" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy Link</>
                  )}
                </button>
                <a
                  href={inviteLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 border border-brand-300 text-brand-600 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Record summary */}
            <div className="text-left bg-gray-50 rounded-xl px-4 py-4 mb-5 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Business</span>
                <span className="font-semibold text-gray-800">{created.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Industry</span>
                <span className="font-semibold text-gray-800">{created.industry}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-gray-500 shrink-0">Types</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {created.types.map((t) => (
                    <span key={t} className="tag-blue text-xs">{t}</span>
                  ))}
                </div>
              </div>
              {created.subtypes.length > 0 && (
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Offerings</span>
                  <span className="font-semibold text-gray-800 text-right text-xs">
                    {created.subtypes.join(", ")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold text-gray-800">{created.phone}</span>
              </div>
              {created.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-semibold text-gray-800">{created.email}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className="tag-blue">Invited</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Token</span>
                <code className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                  {created.id}
                </code>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/businesses"
                className="flex-1 btn-secondary text-sm justify-center"
              >
                View All
              </Link>
              <button
                onClick={reset}
                className="flex-1 btn-primary text-sm justify-center"
              >
                Add Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
