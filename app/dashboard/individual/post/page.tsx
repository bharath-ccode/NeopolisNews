"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Building2,
  Search,
  Loader2,
  IndianRupee,
  Maximize2,
  Bed,
  Car,
  Phone,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { getProjects, type Project } from "@/lib/projectsStore";

type SubCategory = "residential" | "retail" | "office";
type ListingType = "sale" | "rent";
type ProjectMode = "existing" | "new" | "standalone";
type PropertyType = "apartment" | "villa" | "plot" | "shop" | "office_space";
type Furnished = "unfurnished" | "semi-furnished" | "fully-furnished";
type ContactPref = "call" | "whatsapp" | "both";

const STEP_LABELS = ["Consent", "Category", "Location", "Details", "Pricing", "Description", "Contact"];

const AMENITIES = [
  "Gym", "Swimming Pool", "Club House", "Power Backup", "Lift", "Security",
  "CCTV", "Garden", "Kids Play Area", "Co-Working Space", "Rooftop Terrace", "Parking",
];

const PROPERTY_TYPES: Record<SubCategory, { value: PropertyType; label: string }[]> = {
  residential: [
    { value: "apartment",    label: "Apartment"    },
    { value: "villa",        label: "Villa / Row House" },
    { value: "plot",         label: "Plot / Land"  },
  ],
  retail: [
    { value: "shop",         label: "Shop / Retail" },
  ],
  office: [
    { value: "office_space", label: "Office Space"  },
  ],
};

export default function PostListing() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep]       = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [submittedId, setSubmittedId] = useState("");

  // Step 0 — Consent
  const [consent, setConsent] = useState(false);

  // Step 1 — Category
  const [subCategory,  setSubCategory]  = useState<SubCategory>("residential");
  const [listingType,  setListingType]  = useState<ListingType>("sale");

  // Step 2 — Location
  const [projectMode,       setProjectMode]       = useState<ProjectMode>("existing");
  const [selectedProject,   setSelectedProject]   = useState<Project | null>(null);
  const [customProjectName, setCustomProjectName] = useState("");
  const [standaloneDesc,    setStandaloneDesc]     = useState("");
  const [tower,        setTower]        = useState("");
  const [floorNumber,  setFloorNumber]  = useState("");
  const [unitNumber,   setUnitNumber]   = useState("");

  // Step 3 — Details
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [bedrooms,     setBedrooms]     = useState("2");
  const [bathrooms,    setBathrooms]    = useState("2");
  const [carpetArea,   setCarpetArea]   = useState("");
  const [parking,      setParking]      = useState("1");
  const [furnished,    setFurnished]    = useState<Furnished>("semi-furnished");

  // Step 4 — Pricing
  const [price,         setPrice]         = useState("");
  const [deposit,       setDeposit]       = useState("");
  const [availableFrom, setAvailableFrom] = useState("");

  // Step 5 — Description
  const [description, setDescription] = useState("");
  const [amenities,   setAmenities]   = useState<string[]>([]);

  // Step 6 — Contact
  const [ownerName,    setOwnerName]    = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPref,  setContactPref]  = useState<ContactPref>("both");

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = user as any;
      if (!ownerName)    setOwnerName(u.name ?? u.user_metadata?.name ?? "");
      if (!contactPhone) setContactPhone((u.phone ?? "").replace(/^\+91/, ""));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Reset property type when sub-category changes
  useEffect(() => {
    setPropertyType(PROPERTY_TYPES[subCategory][0].value);
  }, [subCategory]);

  const isResidential = subCategory === "residential" && propertyType !== "plot";

  const filteredProjects = projects.filter((p) =>
    p.projectName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  function toggleAmenity(a: string) {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return consent;
      case 1: return true;
      case 2:
        if (projectMode === "existing")   return selectedProject !== null;
        if (projectMode === "new")        return customProjectName.trim().length > 0;
        if (projectMode === "standalone") return standaloneDesc.trim().length > 0;
        return false;
      case 3: return carpetArea.trim().length > 0 || propertyType === "plot";
      case 4: return price.trim().length > 0;
      case 5: return true;
      case 6: return ownerName.trim().length > 0 && contactPhone.replace(/\D/g, "").length >= 10;
      default: return true;
    }
  }

  function next() { if (canProceed()) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function submit() {
    if (!canProceed()) return;
    setLoading(true);
    try {
      const body = {
        ownerName,
        contactPhone,
        contactPreference:   contactPref,
        subCategory,
        listingType,
        projectId:           projectMode === "existing" ? selectedProject?.id : null,
        projectName:         projectMode === "existing"
                               ? selectedProject?.projectName
                               : projectMode === "new"
                               ? customProjectName
                               : null,
        isStandalone:        projectMode === "standalone",
        standaloneDescription: projectMode === "standalone" ? standaloneDesc : null,
        tower:               tower || null,
        floorNumber:         floorNumber || null,
        unitNumber:          unitNumber || null,
        propertyType,
        bedrooms:            isResidential ? bedrooms : null,
        bathrooms:           isResidential ? bathrooms : null,
        carpetAreaSqft:      carpetArea || null,
        parking,
        furnished:           propertyType !== "plot" ? furnished : null,
        availableFrom:       availableFrom || null,
        amenities,
        price,
        deposit:             listingType === "rent" ? deposit : null,
        description,
        photos:              [],
        ownerConsent:        true,
      };

      const res = await fetch("/api/classifieds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to submit");
      }
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

  // ── Success ─────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Listing Submitted!</h2>
        <p className="text-gray-500 text-sm mb-2">
          Your listing is under review. It will appear publicly once our team verifies
          it — usually within 24 hours.
        </p>
        <p className="text-xs text-gray-400 mb-6">Reference: {submittedId.slice(0, 8).toUpperCase()}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard/individual")}
            className="btn-primary text-sm"
          >
            Go to Dashboard <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDone(false); setStep(0); setConsent(false);
              setPrice(""); setDescription(""); setAmenities([]);
              setSelectedProject(null); setCustomProjectName(""); setStandaloneDesc("");
            }}
            className="btn-secondary text-sm"
          >
            Post Another
          </button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Post a Property</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Direct owner listing — no brokerage, verified by our team before going live.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-8">
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

      {/* Card */}
      <div className="card p-6">
        {/* Step heading */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {step + 1}
          </span>
          <h3 className="font-bold text-gray-900">{STEP_LABELS[step]}</h3>
        </div>

        {/* ── Step 0: Consent ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm font-semibold text-amber-900">Owner Declaration Required</p>
              </div>
              <p className="text-sm text-amber-800">
                NeopolisNews only allows direct owner listings. Broker or agent listings
                will be removed. Your consent is recorded with a timestamp as proof of
                ownership declaration.
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 shrink-0"
              />
              <span className="text-sm text-gray-700">
                I confirm that I am the <strong>absolute owner</strong> of this property
                and have the legal right to sell or rent it. This is not a brokerage listing.
                I accept that this declaration is recorded with a timestamp.
              </span>
            </label>
          </div>
        )}

        {/* ── Step 1: Category ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Property Category
              </label>
              <div className="flex gap-3">
                {(["residential", "retail", "office"] as SubCategory[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSubCategory(c)}
                    className={clsx(
                      "flex-1 py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-colors",
                      subCategory === c
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Listing Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setListingType("sale")}
                  className={clsx(
                    "flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors",
                    listingType === "sale"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  )}
                >
                  For Sale (Resale)
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("rent")}
                  className={clsx(
                    "flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors",
                    listingType === "rent"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  )}
                >
                  For Rent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Project mode selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Is this property part of a project or society?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["existing",   "Existing Project"],
                    ["new",        "New / Unlisted"],
                    ["standalone", "Standalone"],
                  ] as [ProjectMode, string][]
                ).map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setProjectMode(m)}
                    className={clsx(
                      "py-2.5 rounded-lg border-2 text-xs font-semibold transition-colors",
                      projectMode === m
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing project search */}
            {projectMode === "existing" && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search project or society name…"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1.5 rounded-lg">
                  {filteredProjects.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">
                      No projects found — try &quot;New / Unlisted&quot; above
                    </p>
                  ) : (
                    filteredProjects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProject(p)}
                        className={clsx(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                          selectedProject?.id === p.id
                            ? "border-brand-400 bg-brand-50"
                            : "border-gray-100 hover:border-gray-200 bg-white"
                        )}
                      >
                        <div className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          selectedProject?.id === p.id ? "bg-brand-100" : "bg-gray-100"
                        )}>
                          <Building2 className={clsx(
                            "w-4 h-4",
                            selectedProject?.id === p.id ? "text-brand-600" : "text-gray-400"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {p.projectName}
                          </p>
                          {p.builderName && (
                            <p className="text-xs text-gray-400">by {p.builderName}</p>
                          )}
                        </div>
                        {selectedProject?.id === p.id && (
                          <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* New project name */}
            {projectMode === "new" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Project / Society Name
                </label>
                <input
                  type="text"
                  value={customProjectName}
                  onChange={(e) => setCustomProjectName(e.target.value)}
                  placeholder="e.g. Sunrise Apartments, Green Valley Society"
                  className={inputClass}
                />
              </div>
            )}

            {/* Standalone description */}
            {projectMode === "standalone" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Brief Property Description
                </label>
                <input
                  type="text"
                  value={standaloneDesc}
                  onChange={(e) => setStandaloneDesc(e.target.value.slice(0, 60))}
                  placeholder="e.g. Corner house near Neopolis park"
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">{standaloneDesc.length}/60 characters</p>
              </div>
            )}

            {/* Tower / Floor / Unit */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Tower / Block{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tower}
                  onChange={(e) => setTower(e.target.value)}
                  placeholder="e.g. Tower A"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Floor
                </label>
                <input
                  type="number"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(e.target.value)}
                  placeholder="e.g. 12"
                  min={0}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Unit No.{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="e.g. 1204"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Property Details ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Property Type
              </label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES[subCategory].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPropertyType(value)}
                    className={clsx(
                      "px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
                      propertyType === value
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isResidential && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    <Bed className="w-3.5 h-3.5 inline mr-1" />BHK
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
                    Bathrooms
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
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  <Maximize2 className="w-3.5 h-3.5 inline mr-1" />
                  Carpet Area (sq ft){" "}
                  {propertyType === "plot" && (
                    <span className="text-gray-400 font-normal">(optional)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(e.target.value)}
                  placeholder="e.g. 1200"
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

            {propertyType !== "plot" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Furnished Status
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      ["unfurnished",    "Unfurnished"],
                      ["semi-furnished", "Semi-Furnished"],
                      ["fully-furnished","Fully-Furnished"],
                    ] as [Furnished, string][]
                  ).map(([f, label]) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFurnished(f)}
                      className={clsx(
                        "flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors",
                        furnished === f
                          ? "border-brand-400 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Pricing ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                {listingType === "rent" ? "Monthly Rent" : "Sale Price"} (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={listingType === "rent" ? "e.g. 45,000" : "e.g. 1,40,00,000"}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {listingType === "rent" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Security Deposit (₹){" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
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
                Available From{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* ── Step 5: Description & Amenities ── */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Description{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property — views, special features, society amenities, neighbourhood advantages…"
                rows={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                      amenities.includes(a)
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    {amenities.includes(a) && (
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                    )}
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 6: Contact ── */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Contact Phone
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
                Contact Preference
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

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
              Your contact details will only be shown to users viewing the listing after it is
              verified. Your number will not be shared publicly in any other context.
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
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {loading ? "Submitting…" : "Submit for Review"}
          </button>
        )}
      </div>

      {step === 0 && (
        <p className="text-center text-xs text-gray-400 mt-3">
          You must accept the owner declaration to continue.
        </p>
      )}
    </div>
  );
}
