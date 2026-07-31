"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car, Bike, Sofa, Tv, Zap, Tag, CheckCircle, ChevronRight, ChevronLeft,
  Loader2, Upload, X, Phone, MessageCircle, IndianRupee,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  { value: "cars",        label: "Cars & Vehicles",    icon: Car   },
  { value: "bikes",       label: "Bikes & Scooters",   icon: Bike  },
  { value: "furniture",   label: "Furniture",          icon: Sofa  },
  { value: "electronics", label: "Electronics",        icon: Tv    },
  { value: "appliances",  label: "Home Appliances",    icon: Zap   },
  { value: "others",      label: "Others",             icon: Tag   },
];

const DURATIONS = [
  { days: 7,  label: "7 days"  },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

const STEP_LABELS = ["Category", "Ad Details", "Contact"];

type ContactPref = "call" | "whatsapp" | "both";

async function uploadPhoto(file: File): Promise<string | null> {
  const sb = createClient();
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await sb.storage.from("classifieds").upload(path, file, { upsert: false });
  if (error || !data) return null;
  return sb.storage.from("classifieds").getPublicUrl(path).data.publicUrl;
}

export default function PostClassified() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step,         setStep]         = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [submittedId,  setSubmittedId]  = useState("");

  // Step 0 — Category
  const [category, setCategory] = useState("");

  // Step 1 — Details
  const [title,        setTitle]        = useState("");
  const [description,  setDescription]  = useState("");
  const [price,        setPrice]        = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [photos,       setPhotos]       = useState<File[]>([]);
  const [previews,     setPreviews]     = useState<string[]>([]);

  // Step 2 — Contact
  const [ownerName,    setOwnerName]    = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPref,  setContactPref]  = useState<ContactPref>("both");

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = user as any;
      if (!ownerName)    setOwnerName(u.name ?? u.user_metadata?.name ?? "");
      if (!contactPhone) setContactPhone((u.phone ?? "").replace(/^\+91/, ""));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 10 - photos.length);
    setPhotos((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  function canProceed(): boolean {
    if (step === 0) return category !== "";
    if (step === 1) return title.trim().length > 0 && description.trim().length > 0;
    if (step === 2) return ownerName.trim().length > 0 && contactPhone.replace(/\D/g, "").length >= 10;
    return false;
  }

  function next() { if (canProceed()) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function submit() {
    if (!canProceed()) return;
    setLoading(true);
    try {
      // Upload photos (best-effort — requires 'classifieds' storage bucket)
      const uploadedUrls: string[] = [];
      for (const file of photos) {
        const url = await uploadPhoto(file);
        if (url) uploadedUrls.push(url);
      }

      const res = await fetch("/api/ads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          category,
          title,
          description,
          price:        price || null,
          photos:       uploadedUrls,
          durationDays,
          ownerName,
          contactPhone,
          contactPref,
        }),
      });

      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
      const { id } = await res.json();
      setSubmittedId(id);
      setDone(true);
    } catch (e) {
      alert((e as Error).message ?? "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Ad Submitted!</h2>
        <p className="text-gray-500 text-sm mb-2">
          Your classified is under review and will go live within 24 hours once
          our team verifies it.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Reference: {submittedId.slice(0, 8).toUpperCase()}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/classifieds")}
            className="btn-primary text-sm"
          >
            Browse Classifieds <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDone(false); setStep(0); setCategory(""); setTitle("");
              setDescription(""); setPrice(""); setPhotos([]); setPreviews([]);
            }}
            className="btn-secondary text-sm"
          >
            Post Another
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Post a Classified</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Sell your car, bike, furniture and more — reviewed &amp; live within 24 hours.
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={clsx(
              "flex-1 h-1.5 rounded-full transition-colors",
              i <= step ? "bg-brand-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      <div className="card p-6">
        {/* Step heading */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {step + 1}
          </span>
          <h3 className="font-bold text-gray-900">{STEP_LABELS[step]}</h3>
        </div>

        {/* ── Step 0: Category ── */}
        {step === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={clsx(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-semibold transition-colors",
                  category === value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                )}
              >
                <Icon className={clsx("w-7 h-7", category === value ? "text-brand-600" : "text-gray-400")} />
                {label}
                {category === value && <CheckCircle className="w-3.5 h-3.5 text-brand-500" />}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 1: Ad Details ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Ad Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  category === "cars"      ? "e.g. 2020 Maruti Swift VXI, 32,000 km" :
                  category === "bikes"     ? "e.g. Honda Activa 6G, 2022, excellent condition" :
                  category === "furniture" ? "e.g. Teakwood dining table with 6 chairs" :
                  "Brief, descriptive title for your ad"
                }
                maxLength={100}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item — condition, age, reason for selling, any defects, included accessories…"
                rows={5}
                className={inputClass}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Price (₹){" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 45,000"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Run ad for
                </label>
                <div className="flex gap-2">
                  {DURATIONS.map(({ days, label }) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDurationDays(days)}
                      className={clsx(
                        "flex-1 py-2.5 rounded-lg border text-xs font-semibold transition-colors",
                        durationDays === days
                          ? "border-brand-400 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Photos{" "}
                <span className="text-gray-400 font-normal">
                  (up to 10 — JPG/PNG)
                </span>
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 10 && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addPhotos(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-medium">
                      {photos.length === 0 ? "Click to add photos" : `Add more (${photos.length}/10)`}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Contact ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500 shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) =>
                      setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="9900000000"
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                How should buyers contact you?
              </label>
              <div className="flex gap-2">
                {(
                  [
                    ["call",      "Call Only",       Phone],
                    ["whatsapp",  "WhatsApp Only",   MessageCircle],
                    ["both",      "Call & WhatsApp", CheckCircle],
                  ] as [ContactPref, string, React.ElementType][]
                ).map(([v, label, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setContactPref(v)}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-semibold transition-colors",
                      contactPref === v
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-xs text-gray-500">
              <p><strong className="text-gray-700">Category:</strong> {CATEGORIES.find((c) => c.value === category)?.label}</p>
              <p><strong className="text-gray-700">Title:</strong> {title}</p>
              {price && <p><strong className="text-gray-700">Price:</strong> ₹{price}</p>}
              <p><strong className="text-gray-700">Duration:</strong> {durationDays} days</p>
              <p><strong className="text-gray-700">Photos:</strong> {photos.length} attached</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-5">
        {step > 0 && (
          <button onClick={back} className="btn-secondary">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < STEP_LABELS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={loading || !canProceed()}
            className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {loading ? "Submitting…" : "Submit for Review"}
          </button>
        )}
      </div>
    </div>
  );
}
