"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, ChevronRight, ChevronLeft, Building2, Search, Loader2,
  IndianRupee, Maximize2, Bed, Car, Phone, MessageCircle,
} from "lucide-react";
import clsx from "clsx";
import { useBrokerAuth } from "@/context/BrokerAuthContext";
import { getProjects, type Project } from "@/lib/projectsStore";

type SubCategory  = "residential" | "retail" | "office";
type ListingType  = "sale" | "rent";
type ProjectMode  = "existing" | "new" | "standalone";
type PropertyType = "apartment" | "villa" | "plot" | "shop" | "office_space";
type Furnished    = "unfurnished" | "semi-furnished" | "fully-furnished";
type ContactPref  = "call" | "whatsapp" | "both";

const STEP_LABELS = ["Category", "Location", "Details", "Pricing", "Description", "Contact"];

const AMENITIES = [
  "Gym", "Swimming Pool", "Club House", "Power Backup", "Lift", "Security",
  "CCTV", "Garden", "Kids Play Area", "Co-Working Space", "Rooftop Terrace", "Parking",
];

const PROPERTY_TYPES: Record<SubCategory, { value: PropertyType; label: string }[]> = {
  residential: [
    { value: "apartment",    label: "Apartment"         },
    { value: "villa",        label: "Villa / Row House" },
    { value: "plot",         label: "Plot / Land"       },
  ],
  retail: [
    { value: "shop",         label: "Shop / Retail"     },
  ],
  office: [
    { value: "office_space", label: "Office Space"      },
  ],
};

export default function BrokerCreateListing() {
  const router = useRouter();
  const { broker } = useBrokerAuth();

  const [step,    setStep]    = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [submittedId, setSubmittedId] = useState("");

  // Step 0 — Category
  const [subCategory,  setSubCategory]  = useState<SubCategory>("residential");
  const [listingType,  setListingType]  = useState<ListingType>("sale");

  // Step 1 — Location
  const [projectMode,       setProjectMode]       = useState<ProjectMode>("existing");
  const [selectedProject,   setSelectedProject]   = useState<Project | null>(null);
  const [customProjectName, setCustomProjectName] = useState("");
  const [standaloneDesc,    setStandaloneDesc]     = useState("");
  const [tower,        setTower]        = useState("");
  const [floorNumber,  setFloorNumber]  = useState("");
  const [unitNumber,   setUnitNumber]   = useState("");

  // Step 2 — Details
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [bedrooms,     setBedrooms]     = useState("2");
  const [bathrooms,    setBathrooms]    = useState("2");
  const [carpetArea,   setCarpetArea]   = useState("");
  const [parking,      setParking]      = useState("1");
  const [furnished,    setFurnished]    = useState<Furnished>("semi-furnished");

  // Step 3 — Pricing
  const [price,         setPrice]         = useState("");
  const [deposit,       setDeposit]       = useState("");
  const [availableFrom, setAvailableFrom] = useState("");

  // Step 4 — Description
  const [description, setDescription] = useState("");
  const [amenities,   setAmenities]   = useState<string[]>([]);

  // Step 5 — Contact
  const [ownerName,    setOwnerName]    = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPref,  setContactPref]  = useState<ContactPref>("both");

  useEffect(() => { getProjects().then(setProjects).catch(() => {}); }, []);
  useEffect(() => { setPropertyType(PROPERTY_TYPES[subCategory][0].value); }, [subCategory]);

  useEffect(() => {
    if (broker) {
      if (!ownerName)    setOwnerName(broker.name);
      if (!contactPhone) setContactPhone(broker.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broker]);

  const isResidential = subCategory === "residential" && propertyType !== "plot";
  const filteredProjects = projects.filter((p) =>
    p.projectName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  function toggleAmenity(a: string) {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return true;
      case 1:
        if (projectMode === "existing")   return selectedProject !== null;
        if (projectMode === "new")        return customProjectName.trim().length > 0;
        if (projectMode === "standalone") return standaloneDesc.trim().length > 0;
        return false;
      case 2: return carpetArea.trim().length > 0 || propertyType === "plot";
      case 3: return price.trim().length > 0;
      case 4: return true;
      case 5: return ownerName.trim().length > 0 && contactPhone.replace(/\D/g, "").length >= 10;
      default: return true;
    }
  }

  function next() { if (canProceed()) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function submit() {
    if (!canProceed()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/broker/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          contactPhone,
          contactPreference:    contactPref,
          subCategory,
          listingType,
          projectId:            projectMode === "existing" ? selectedProject?.id : null,
          projectName:          projectMode === "existing"
                                  ? selectedProject?.projectName
                                  : projectMode === "new"
                                  ? customProjectName
                                  : null,
          isStandalone:         projectMode === "standalone",
          standaloneDescription: projectMode === "standalone" ? standaloneDesc : null,
          tower:                tower || null,
          floorNumber:          floorNumber || null,
          unitNumber:           unitNumber || null,
          propertyType,
          bedrooms:             isResidential ? bedrooms : null,
          bathrooms:            isResidential ? bathrooms : null,
          carpetAreaSqft:       carpetArea || null,
          parking,
          furnished:            propertyType !== "plot" ? furnished : null,
          availableFrom:        availableFrom || null,
          amenities,
          price,
          deposit:              listingType === "rent" ? deposit : null,
          description,
          photos:               [],
        }),
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

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Listing Live!</h2>
        <p className="text-gray-500 text-sm mb-2">
          Your listing is now active on NeopolisNews.
        </p>
        <p className="text-xs text-gray-400 mb-6">ID: {submittedId.slice(0, 8).toUpperCase()}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push("/broker/listings")} className="btn-primary text-sm">
            View Listings <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDone(false); setStep(0);
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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Post a Listing</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          As a verified broker, your listings go live immediately.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEP_LABELS.map((_, i) => (
          <div key={i} className={clsx("flex-1 h-1.5 rounded-full transition-colors", i <= step ? "bg-brand-500" : "bg-gray-200")} />
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {step + 1}
          </span>
          <h3 className="font-bold text-gray-900">{STEP_LABELS[step]}</h3>
        </div>

        {/* ── Step 0: Category ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Property Category</label>
              <div className="flex gap-3">
                {(["residential", "retail", "office"] as SubCategory[]).map((c) => (
                  <button key={c} type="button" onClick={() => setSubCategory(c)}
                    className={clsx("flex-1 py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-colors",
                      subCategory === c ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Listing Type</label>
              <div className="flex gap-3">
                {([["sale", "For Sale (Resale)"], ["rent", "For Rent"]] as [ListingType, string][]).map(([v, label]) => (
                  <button key={v} type="button" onClick={() => setListingType(v)}
                    className={clsx("flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors",
                      listingType === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Location ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Project / Location</label>
              <div className="flex gap-2 mb-3">
                {([["existing", "Existing Project"], ["new", "New Project"], ["standalone", "Standalone"]] as [ProjectMode, string][]).map(([v, label]) => (
                  <button key={v} type="button" onClick={() => setProjectMode(v)}
                    className={clsx("flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors",
                      projectMode === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}>{label}</button>
                ))}
              </div>
            </div>

            {projectMode === "existing" && (
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input type="text" value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects…" className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredProjects.map((p) => (
                    <button key={p.id} type="button" onClick={() => setSelectedProject(p)}
                      className={clsx("w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
                        selectedProject?.id === p.id ? "bg-brand-50 text-brand-700 font-semibold" : "hover:bg-gray-50 text-gray-700"
                      )}>
                      <span className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        {p.projectName}
                      </span>
                    </button>
                  ))}
                  {filteredProjects.length === 0 && (
                    <p className="text-xs text-gray-400 px-3 py-2">No projects found</p>
                  )}
                </div>
              </div>
            )}

            {projectMode === "new" && (
              <input type="text" value={customProjectName} onChange={(e) => setCustomProjectName(e.target.value)}
                placeholder="Enter project name" className={inputClass} />
            )}

            {projectMode === "standalone" && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Brief description (max 60 chars)</label>
                <input type="text" value={standaloneDesc} onChange={(e) => setStandaloneDesc(e.target.value.slice(0, 60))}
                  placeholder="e.g. Corner flat near main gate" className={inputClass} maxLength={60} />
                <p className="text-xs text-gray-400 mt-1">{standaloneDesc.length}/60</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Tower / Block</label>
                <input type="text" value={tower} onChange={(e) => setTower(e.target.value)}
                  placeholder="Optional" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Floor</label>
                <input type="number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)}
                  placeholder="Optional" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Unit No.</label>
                <input type="text" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="Optional" className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Details ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Property Type</label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES[subCategory].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setPropertyType(value)}
                    className={clsx("px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                      propertyType === value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}>{label}</button>
                ))}
              </div>
            </div>

            {isResidential && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Bed className="w-3 h-3" />Bedrooms</label>
                  <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inputClass}>
                    {["1","2","3","4","5","6+"].map((v) => <option key={v} value={v}>{v} BHK</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Bathrooms</label>
                  <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={inputClass}>
                    {["1","2","3","4","5+"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Maximize2 className="w-3 h-3" />Carpet Area (sqft)</label>
                <input type="number" value={carpetArea} onChange={(e) => setCarpetArea(e.target.value)}
                  placeholder={propertyType === "plot" ? "Optional" : "Required"} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Car className="w-3 h-3" />Parking</label>
                <select value={parking} onChange={(e) => setParking(e.target.value)} className={inputClass}>
                  {["0","1","2","3+"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {propertyType !== "plot" && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Furnishing</label>
                <div className="flex gap-2">
                  {(["unfurnished","semi-furnished","fully-furnished"] as Furnished[]).map((v) => (
                    <button key={v} type="button" onClick={() => setFurnished(v)}
                      className={clsx("flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-colors",
                        furnished === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}>{v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Pricing ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                {listingType === "sale" ? "Sale Price" : "Monthly Rent"} <span className="text-red-400">*</span>
              </label>
              <input type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 85,00,000" className={inputClass} />
            </div>
            {listingType === "rent" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Security Deposit</label>
                <input type="text" value={deposit} onChange={(e) => setDeposit(e.target.value)}
                  placeholder="Optional" className={inputClass} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Available From</label>
              <input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* ── Step 4: Description ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the property, highlights, nearby amenities…"
                rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={clsx("px-2.5 py-1 rounded-full border text-xs font-medium transition-colors",
                      amenities.includes(a) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Contact ── */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact Name <span className="text-red-400">*</span></label>
              <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Your name" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3" />Phone <span className="text-red-400">*</span></label>
              <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                placeholder="10-digit number" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Contact Preference</label>
              <div className="flex gap-2">
                {([["call","Call only"],["whatsapp","WhatsApp only"],["both","Both"]] as [ContactPref,string][]).map(([v,label]) => (
                  <button key={v} type="button" onClick={() => setContactPref(v)}
                    className={clsx("flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-1",
                      contactPref === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}>
                    {v === "whatsapp" && <MessageCircle className="w-3 h-3" />}
                    {v === "call" && <Phone className="w-3 h-3" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-xs text-gray-600 mt-2">
              <p className="font-semibold text-gray-800 mb-2">Listing Summary</p>
              <p><span className="text-gray-400">Category:</span> {subCategory} · {listingType === "sale" ? "For Sale" : "For Rent"}</p>
              <p><span className="text-gray-400">Type:</span> {propertyType.replace("_", " ")}</p>
              {isResidential && <p><span className="text-gray-400">BHK:</span> {bedrooms} bed / {bathrooms} bath</p>}
              {carpetArea && <p><span className="text-gray-400">Area:</span> {carpetArea} sqft</p>}
              <p><span className="text-gray-400">Price:</span> ₹{price}</p>
              <p className="font-medium text-green-600 mt-1">Goes live immediately ✓</p>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
          <button onClick={back} disabled={step === 0}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button onClick={next} disabled={!canProceed()}
              className="flex items-center gap-1.5 btn-primary text-sm py-2 disabled:opacity-50">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={loading || !canProceed()}
              className="flex items-center gap-1.5 btn-primary text-sm py-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
