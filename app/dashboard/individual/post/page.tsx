"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  Maximize2,
  Bed,
  Bath,
  Car,
  Upload,
  CheckCircle,
  ArrowRight,
  Loader2,
  Building2,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import {
  PROJECTS,
  AMENITIES_LIST,
  saveListing,
  type ListingType,
  type PropertyType,
  type FurnishedStatus,
} from "@/lib/listings";

export default function PostIndividualListing() {
  const router = useRouter();
  const { user } = useAuth();

  // Step 1 — project selection
  const [projectId, setProjectId] = useState("");

  // Step 2+ — rest of the form
  const [listingType, setListingType] = useState<ListingType>("rent");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [tower, setTower] = useState("");
  const [floor, setFloor] = useState("");
  const [unit, setUnit] = useState("");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [carpetArea, setCarpetArea] = useState("");
  const [parking, setParking] = useState("1");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [available, setAvailable] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [furnished, setFurnished] = useState<FurnishedStatus>("semi-furnished");
  const [ownerName, setOwnerName] = useState(user?.name ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const selectedProject = PROJECTS.find((p) => p.id === projectId);

  function toggleAmenity(a: string) {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  function handleProjectSelect(id: string) {
    setProjectId(id);
    setTower(""); // reset tower when project changes
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    setLoading(true);

    const listing = {
      id: `listing_${Date.now()}`,
      userId: user?.id ?? "guest",
      ownerName,
      contactPhone,
      projectId,
      projectName: selectedProject.name,
      tower,
      floor,
      unit,
      listingType,
      propertyType,
      bedrooms,
      bathrooms,
      carpetArea,
      parking,
      furnished,
      price,
      deposit,
      availableFrom: available,
      amenities,
      description,
      status: "active" as const,
      postedOn: new Date().toISOString(),
      views: 0,
      enquiries: 0,
    };

    saveListing(listing);
    await new Promise((r) => setTimeout(r, 800));
    setDone(true);
    setLoading(false);
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Listing Published!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your property in <strong>{selectedProject?.name}</strong> is now live.
          Buyers and tenants can find and contact you directly.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard/individual/listings")}
            className="btn-primary text-sm"
          >
            View My Listings <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDone(false);
              setProjectId("");
              setPrice("");
              setDescription("");
              setAmenities([]);
            }}
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

  // ── Project selection ───────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Post a Property</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          List your home for sale or rent — reach verified buyers &amp; tenants instantly.
        </p>
      </div>

      {/* ── Step 1: Project ── */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            1
          </span>
          <h3 className="font-bold text-sm text-gray-900">Select Project</h3>
          {selectedProject && (
            <span className="ml-auto text-xs font-semibold text-brand-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> {selectedProject.name}
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleProjectSelect(p.id)}
              className={clsx(
                "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors",
                projectId === p.id
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div
                className={clsx(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  projectId === p.id
                    ? "bg-brand-100"
                    : "bg-gray-100"
                )}
              >
                <Building2
                  className={clsx(
                    "w-5 h-5",
                    projectId === p.id ? "text-brand-600" : "text-gray-400"
                  )}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={clsx(
                    "text-sm font-bold leading-snug",
                    projectId === p.id ? "text-brand-700" : "text-gray-800"
                  )}
                >
                  {p.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{p.type}</p>
              </div>
              {projectId === p.id && (
                <CheckCircle className="w-4 h-4 text-brand-500 shrink-0 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Rest of form (only shown once project is selected) ── */}
      {selectedProject && (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Listing type */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="font-bold text-sm text-gray-900">Listing Type</h3>
            </div>
            <div className="flex gap-3">
              {(["rent", "sale"] as ListingType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setListingType(t)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    listingType === t
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {t === "rent" ? "For Rent" : "For Sale"}
                </button>
              ))}
            </div>
          </div>

          {/* Property details */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="font-bold text-sm text-gray-900">Property Details</h3>
            </div>

            {/* Property type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Property type
              </label>
              <div className="flex flex-wrap gap-2">
                {(["apartment", "villa", "office", "shop", "plot"] as PropertyType[]).map((pt) => (
                  <button
                    type="button"
                    key={pt}
                    onClick={() => setPropertyType(pt)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors capitalize ${
                      propertyType === pt
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Tower + floor + unit */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Tower / Block
                </label>
                <select
                  value={tower}
                  onChange={(e) => setTower(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {selectedProject.towers.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Floor
                </label>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g. 12"
                  min={1}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Unit no.
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. B-1204"
                  className={inputClass}
                />
              </div>
            </div>

            {/* BHK / area / parking */}
            {(propertyType === "apartment" || propertyType === "villa") && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    <Bed className="w-3.5 h-3.5 inline mr-1" />Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className={inputClass}
                  >
                    {["1", "2", "3", "4", "5+"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    <Bath className="w-3.5 h-3.5 inline mr-1" />Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className={inputClass}
                  >
                    {["1", "2", "3", "4"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    <Maximize2 className="w-3.5 h-3.5 inline mr-1" />Carpet (sq ft)
                  </label>
                  <input
                    type="number"
                    value={carpetArea}
                    onChange={(e) => setCarpetArea(e.target.value)}
                    placeholder="e.g. 1200"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    <Car className="w-3.5 h-3.5 inline mr-1" />Parking
                  </label>
                  <select
                    value={parking}
                    onChange={(e) => setParking(e.target.value)}
                    className={inputClass}
                  >
                    {["0", "1", "2", "3+"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Furnished */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Furnished status
              </label>
              <div className="flex gap-2">
                {(["unfurnished", "semi-furnished", "fully-furnished"] as FurnishedStatus[]).map(
                  (f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setFurnished(f)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        furnished === f
                          ? "border-brand-400 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-400"
                      }`}
                    >
                      {f.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <h3 className="font-bold text-sm text-gray-900">Pricing</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {listingType === "rent" ? "Monthly Rent" : "Sale Price"}
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={
                      listingType === "rent" ? "e.g. 45,000" : "e.g. 1,40,00,000"
                    }
                    required
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              {listingType === "rent" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Security Deposit
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="e.g. 2,70,000"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Available from
                </label>
                <input
                  type="date"
                  value={available}
                  onChange={(e) => setAvailable(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="font-bold text-sm text-gray-900">Amenities</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                    amenities.includes(a)
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {amenities.includes(a) && (
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                  )}
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                6
              </span>
              <h3 className="font-bold text-sm text-gray-900">Description</h3>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your property — views, special features, society details, neighbourhood advantages…"
              rows={4}
              className={inputClass}
            />
          </div>

          {/* Photos */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                7
              </span>
              <h3 className="font-bold text-sm text-gray-900">Photos</h3>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 text-gray-400 hover:border-brand-300 transition-colors cursor-pointer">
              <Upload className="w-8 h-8" />
              <p className="text-sm font-medium">Click to upload or drag &amp; drop</p>
              <p className="text-xs">JPG, PNG up to 10MB each · Up to 15 photos</p>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                8
              </span>
              <h3 className="font-bold text-sm text-gray-900">Contact Details</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Owner name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Your name"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Contact phone
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) =>
                      setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="9900000000"
                    required
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              Show my number to verified users only
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {loading ? "Publishing…" : "Publish Listing"}
          </button>
        </form>
      )}

      {!selectedProject && (
        <p className="text-sm text-gray-400 text-center mt-2">
          Select a project above to continue
        </p>
      )}
    </div>
  );
}
