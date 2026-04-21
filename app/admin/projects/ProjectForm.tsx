"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, PlusCircle, Trash2, ChevronDown, ChevronUp,
  Building2, Phone, Globe, Users, Layers, LayoutList, ExternalLink,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { getBuilders, type Builder } from "@/lib/buildersStore";
import {
  createProject, updateProject,
  type Project, type ProjectInput, type ProjectType, type ProjectTier,
  type UnitFacing, type UnitPlan, type ContactPhone, type Tower, type TowerFloorPlan,
} from "@/lib/projectsStore";

// ─── Constants ────────────────────────────────────────────────────────────────

const emptyPhone    = (): ContactPhone => ({ phoneNumber: "", role: "sales", sortOrder: 0 });
const emptyTower    = (i: number): Tower => ({ towerName: `Tower ${i + 1}`, numFloors: 1, sortOrder: i, floorPlans: [] });
const emptyUnitPlan = (i: number): UnitPlan => ({
  planName: "", bhk: 3, maidRoom: false, homeOffice: false,
  sizeSqft: 0, facing: null, planUrl: null, sortOrder: i,
});

const PHONE_ROLES: { value: ContactPhone["role"]; label: string }[] = [
  { value: "sales",      label: "Sales"      },
  { value: "service",    label: "Service"    },
  { value: "front_desk", label: "Front Desk" },
];

const FACING_OPTIONS: UnitFacing[] = [
  "North", "South", "East", "West",
  "North-East", "North-West", "South-East", "South-West",
];

type Tab = "info" | "contacts" | "towers" | "unit_plans";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectFormProps {
  initialData?: Project;
  lockedBuilderId?: string;
  redirectTo?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectForm({ initialData, lockedBuilderId, redirectTo }: ProjectFormProps) {
  const router = useRouter();
  const [tab, setTab]         = useState<Tab>("info");
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Project Info
  const [projectName, setProjectName]   = useState(initialData?.projectName ?? "");
  const [builderId, setBuilderId]       = useState(lockedBuilderId ?? initialData?.builderId ?? "");
  const [totalLandArea, setTotalLandArea] = useState(initialData?.totalLandAreaAcres?.toString() ?? "");
  const [totalUnits, setTotalUnits]     = useState(initialData?.totalUnits?.toString() ?? "");
  const [coreNeopolis, setCoreNeopolis] = useState(initialData?.coreNeopolis ?? false);
  const [projectLogoUrl, setProjectLogoUrl] = useState<string | null>(initialData?.projectLogoUrl ?? null);
  const [projectPlanUrl, setProjectPlanUrl] = useState(initialData?.projectPlanUrl ?? "");
  const [projectType, setProjectType]   = useState<ProjectType | "">(initialData?.projectType ?? "");
  const [tier, setTier]                 = useState<ProjectTier | "">(initialData?.tier ?? "");
  const [maxFloors, setMaxFloors]       = useState(initialData?.projectDetail?.maxFloors?.toString() ?? "");
  const [amenitiesSqft, setAmenitiesSqft] = useState(initialData?.projectDetail?.amenitiesSqft?.toString() ?? "");
  const [priceRangeMin, setPriceRangeMin] = useState(initialData?.priceRangeMin?.toString() ?? "");
  const [priceRangeMax, setPriceRangeMax] = useState(initialData?.priceRangeMax?.toString() ?? "");

  // Contact
  const [contactEmail, setContactEmail]     = useState(initialData?.contact?.email ?? "");
  const [contactWebsite, setContactWebsite] = useState(initialData?.contact?.website ?? "");
  const [projectOwner, setProjectOwner]     = useState(initialData?.contact?.projectOwner ?? "");
  const [facebookUrl, setFacebookUrl]       = useState(initialData?.contact?.facebookUrl ?? "");
  const [instagramUrl, setInstagramUrl]     = useState(initialData?.contact?.instagramUrl ?? "");
  const [youtubeUrl, setYoutubeUrl]         = useState(initialData?.contact?.youtubeUrl ?? "");
  const [phones, setPhones] = useState<ContactPhone[]>(
    initialData?.contact?.phones?.length ? initialData.contact.phones : [emptyPhone()]
  );

  // Towers — convert unitPlanId → unitPlanIndex using the initial unit plans list
  const [towers, setTowers] = useState<Tower[]>(() => {
    if (!initialData?.projectDetail?.towers?.length) return [emptyTower(0)];
    return initialData.projectDetail.towers.map(t => ({
      ...t,
      floorPlans: (t.floorPlans ?? []).map(fp => ({
        ...fp,
        unitPlanIndex: initialData.unitPlans?.findIndex(u => u.id === fp.unitPlanId) ?? -1,
      })).filter(fp => (fp.unitPlanIndex ?? -1) >= 0),
    }));
  });

  // Unit Plans
  const [unitPlans, setUnitPlans] = useState<UnitPlan[]>(
    initialData?.unitPlans?.length ? initialData.unitPlans : []
  );

  useEffect(() => {
    if (lockedBuilderId) return;
    getBuilders().then(setBuilders).catch(() => {});
  }, [lockedBuilderId]);

  const isEdit = !!initialData;

  // ── Phone helpers ──
  const addPhone    = () => { if (phones.length < 5) setPhones(p => [...p, emptyPhone()]); };
  const removePhone = (i: number) => setPhones(p => p.filter((_, idx) => idx !== i));
  const updatePhone = (i: number, field: keyof ContactPhone, value: string) =>
    setPhones(p => p.map((ph, idx) => idx === i ? { ...ph, [field]: value } : ph));

  // ── Tower helpers ──
  const addTower    = () => setTowers(t => [...t, emptyTower(t.length)]);
  const removeTower = (i: number) => setTowers(t => t.filter((_, idx) => idx !== i));
  const updateTower = (i: number, field: keyof Tower, value: string | number) =>
    setTowers(t => t.map((tw, idx) => idx === i ? { ...tw, [field]: value } : tw));

  const toggleTowerFloorPlan = (tIdx: number, planIdx: number, checked: boolean) => {
    setTowers(ts => ts.map((tw, i) => {
      if (i !== tIdx) return tw;
      if (checked) {
        const newFp: TowerFloorPlan = {
          unitPlanId: unitPlans[planIdx]?.id ?? "",
          unitPlanIndex: planIdx,
          floorFrom: null, floorTo: null, unitsPerFloor: 1, sortOrder: tw.floorPlans.length,
        };
        return { ...tw, floorPlans: [...tw.floorPlans, newFp] };
      }
      return { ...tw, floorPlans: tw.floorPlans.filter(fp => fp.unitPlanIndex !== planIdx) };
    }));
  };

  const updateTowerFloorPlan = (
    tIdx: number, planIdx: number,
    field: "floorFrom" | "floorTo" | "unitsPerFloor",
    value: number | null,
  ) => {
    setTowers(ts => ts.map((tw, i) => {
      if (i !== tIdx) return tw;
      return {
        ...tw,
        floorPlans: tw.floorPlans.map(fp =>
          fp.unitPlanIndex === planIdx ? { ...fp, [field]: value } : fp
        ),
      };
    }));
  };

  // ── Unit plan helpers ──
  const addUnitPlan    = () => setUnitPlans(u => [...u, emptyUnitPlan(u.length)]);
  const removeUnitPlan = (i: number) => setUnitPlans(u => u.filter((_, idx) => idx !== i));
  const updateUnitPlan = (i: number, field: keyof UnitPlan, value: string | number | boolean | null) =>
    setUnitPlans(u => u.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) { setError("Project name is required."); setTab("info"); return; }
    setError(null);
    setSaving(true);

    // Build filtered unit plans (valid only) and an index remap
    const filteredUnitPlans = unitPlans
      .filter(u => u.planName.trim() && u.sizeSqft > 0)
      .map((u, i) => ({ ...u, sortOrder: i }));
    // Map original unitPlans index → filtered array index
    const indexRemap = new Map<number, number>();
    let fi = 0;
    for (let oi = 0; oi < unitPlans.length; oi++) {
      const u = unitPlans[oi];
      if (u.planName.trim() && u.sizeSqft > 0) indexRemap.set(oi, fi++);
    }

    const input: ProjectInput = {
      projectName:           projectName.trim(),
      builderId:             builderId || null,
      totalLandAreaAcres:    totalLandArea ? parseFloat(totalLandArea) : null,
      totalUnits:            totalUnits    ? parseInt(totalUnits, 10)  : null,
      coreNeopolis,
      projectLogoUrl,
      projectPlanUrl:        projectPlanUrl || null,
      projectType:           projectType   || null,
      tier:                  tier          || null,
      priceRangeMin:         priceRangeMin ? parseFloat(priceRangeMin) : null,
      priceRangeMax:         priceRangeMax ? parseFloat(priceRangeMax) : null,
      contact: {
        email:        contactEmail   || null,
        website:      contactWebsite || null,
        projectOwner: projectOwner   || null,
        facebookUrl:  facebookUrl    || null,
        instagramUrl: instagramUrl   || null,
        youtubeUrl:   youtubeUrl     || null,
        phones:       phones.filter(p => p.phoneNumber.trim()),
      },
      projectDetail: {
        numTowers:     towers.length,
        maxFloors:     maxFloors     ? parseInt(maxFloors, 10)     : null,
        amenitiesSqft: amenitiesSqft ? parseInt(amenitiesSqft, 10) : null,
        towers: towers.map((t, i) => ({
          ...t,
          sortOrder: i,
          // Remap floor plan indices to match the filtered unitPlans array order
          floorPlans: t.floorPlans
            .filter(fp => fp.unitPlanIndex !== undefined && indexRemap.has(fp.unitPlanIndex))
            .map(fp => ({ ...fp, unitPlanIndex: indexRemap.get(fp.unitPlanIndex!)! })),
        })),
      },
      unitPlans: filteredUnitPlans,
    };

    try {
      if (isEdit) await updateProject(initialData!.id, input);
      else        await createProject(input);
      router.push(redirectTo ?? "/admin/projects");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "info",       label: "Project Info",                    icon: Building2  },
    { key: "contacts",   label: "Contacts",                        icon: Users      },
    { key: "towers",     label: "Towers",                          icon: Layers     },
    { key: "unit_plans", label: `Unit Plans (${unitPlans.length})`, icon: LayoutList },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 gap-1 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === key ? "border-brand-500 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ── Tab: Project Info ── */}
      {tab === "info" && (
        <div className="space-y-5">
          <div>
            <label className="label">Project Logo</label>
            <ImageUpload value={projectLogoUrl} onChange={setProjectLogoUrl} folder="projects/logos" label="Upload Logo" />
          </div>

          <div>
            <label className="label">Project Name <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g. MSN One" value={projectName}
              onChange={e => setProjectName(e.target.value)} required />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              Project Layout / Master Plan
              <span className="text-xs text-gray-400 font-normal">(PDF or image URL)</span>
            </label>
            <div className="flex gap-2">
              <input className="input flex-1" type="url" placeholder="https://…"
                value={projectPlanUrl}
                onChange={e => setProjectPlanUrl(e.target.value)} />
              {projectPlanUrl && (
                <a href={projectPlanUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-brand-600 hover:border-brand-300 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Link to the overall project layout diagram shown on the public project page.</p>
          </div>

          {!lockedBuilderId && (
            <div>
              <label className="label">Builder</label>
              <select className="input" value={builderId} onChange={e => setBuilderId(e.target.value)}>
                <option value="">— Select a builder —</option>
                {builders.map(b => <option key={b.id} value={b.id}>{b.builderName}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Project Type</label>
              <select className="input" value={projectType} onChange={e => setProjectType(e.target.value as ProjectType | "")}>
                <option value="">— Select type —</option>
                <option value="apartments">Apartments</option>
                <option value="independent_homes">Independent Homes</option>
                <option value="residential">Residential (Mixed)</option>
                <option value="mixed_use">Mixed Use</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="label">Tier</label>
              <select className="input" value={tier} onChange={e => setTier(e.target.value as ProjectTier | "")}>
                <option value="">— Select tier —</option>
                <option value="affordable">Affordable</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
                <option value="uber_luxury">Uber Luxury</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Total Land Area (acres)</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="e.g. 7.7"
                value={totalLandArea} onChange={e => setTotalLandArea(e.target.value)} />
            </div>
            <div>
              <label className="label">Total Units</label>
              <input className="input" type="number" min="0" placeholder="e.g. 655"
                value={totalUnits} onChange={e => setTotalUnits(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max Floors</label>
              <input className="input" type="number" min="0" placeholder="e.g. 55"
                value={maxFloors} onChange={e => setMaxFloors(e.target.value)} />
            </div>
            <div>
              <label className="label">Amenities Area (sq ft)</label>
              <input className="input" type="number" min="0" placeholder="e.g. 180000"
                value={amenitiesSqft} onChange={e => setAmenitiesSqft(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">
              Price Range <span className="text-xs text-gray-400 font-normal ml-1">(₹ per sq ft · optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input className="input" type="number" min="0" placeholder="Min e.g. 12000"
                value={priceRangeMin} onChange={e => setPriceRangeMin(e.target.value)} />
              <input className="input" type="number" min="0" placeholder="Max e.g. 18000"
                value={priceRangeMax} onChange={e => setPriceRangeMax(e.target.value)} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Leave blank to keep pricing off the public page.</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={coreNeopolis} onChange={e => setCoreNeopolis(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            <div>
              <span className="text-sm font-medium text-gray-900">Core Neopolis</span>
              <p className="text-xs text-gray-400">Mark if this is a core/flagship Neopolis project</p>
            </div>
          </label>
        </div>
      )}

      {/* ── Tab: Contacts ── */}
      {tab === "contacts" && (
        <div className="space-y-5">
          <div>
            <label className="label">Project Owner</label>
            <input className="input" placeholder="Owner name or company" value={projectOwner}
              onChange={e => setProjectOwner(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="project@example.com"
                value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" type="url" placeholder="https://project.com"
                value={contactWebsite} onChange={e => setContactWebsite(e.target.value)} />
            </div>
          </div>
          <div>
            <p className="label flex items-center gap-1.5 mb-3"><Globe className="w-3.5 h-3.5" /> Social Media</p>
            <div className="space-y-3">
              {[
                { label: "Facebook",  color: "text-blue-600", value: facebookUrl,  setter: setFacebookUrl,  ph: "https://facebook.com/project" },
                { label: "Instagram", color: "text-pink-600", value: instagramUrl, setter: setInstagramUrl, ph: "https://instagram.com/project" },
                { label: "YouTube",   color: "text-red-600",  value: youtubeUrl,   setter: setYoutubeUrl,   ph: "https://youtube.com/@project"  },
              ].map(({ label, color, value, setter, ph }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${color} w-20 shrink-0`}>{label}</span>
                  <input className="input flex-1" type="url" placeholder={ph} value={value}
                    onChange={e => setter(e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="label flex items-center gap-1.5 mb-0">
                <Phone className="w-3.5 h-3.5" /> Phone Numbers
                <span className="text-gray-400 font-normal">({phones.length}/5)</span>
              </p>
              {phones.length < 5 && (
                <button type="button" onClick={addPhone}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Add Number
                </button>
              )}
            </div>
            <div className="space-y-3">
              {phones.map((ph, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select className="input w-36 shrink-0" value={ph.role}
                    onChange={e => updatePhone(i, "role", e.target.value)}>
                    {PHONE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <input className="input flex-1" type="tel" placeholder="+91 98765 43210"
                    value={ph.phoneNumber} onChange={e => updatePhone(i, "phoneNumber", e.target.value)} />
                  {phones.length > 1 && (
                    <button type="button" onClick={() => removePhone(i)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Towers ── */}
      {tab === "towers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Towers ({towers.length})</p>
            <button type="button" onClick={addTower}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Add Tower
            </button>
          </div>
          {towers.map((tower, tIdx) => {
            const validPlans = unitPlans.filter(u => u.planName.trim() && u.sizeSqft > 0);
            return (
              <div key={tIdx} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-semibold text-sm text-gray-700 flex-1">
                    {tower.towerName || `Tower ${tIdx + 1}`}
                  </span>
                  {towers.length > 1 && (
                    <button type="button" onClick={() => removeTower(tIdx)}
                      className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tower Name</label>
                    <input className="input" placeholder="e.g. Tower A" value={tower.towerName}
                      onChange={e => updateTower(tIdx, "towerName", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Number of Floors</label>
                    <input className="input" type="number" min="1" value={tower.numFloors}
                      onChange={e => updateTower(tIdx, "numFloors", parseInt(e.target.value, 10) || 1)} />
                  </div>
                </div>

                {/* Floor Plan Assignment */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Floor Plans in This Tower
                  </p>
                  {validPlans.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      Add unit plans in the &ldquo;Unit Plans&rdquo; tab first.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {unitPlans.map((plan, planIdx) => {
                        if (!plan.planName.trim() || plan.sizeSqft <= 0) return null;
                        const fp = tower.floorPlans.find(f => f.unitPlanIndex === planIdx);
                        const isChecked = !!fp;
                        return (
                          <div key={planIdx} className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => toggleTowerFloorPlan(tIdx, planIdx, e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {plan.planName}
                                <span className="ml-1.5 text-xs text-gray-400 font-normal">
                                  {plan.bhk} BHK · {plan.sizeSqft.toLocaleString()} sft
                                  {plan.facing ? ` · ${plan.facing}` : ""}
                                </span>
                              </span>
                            </label>
                            {isChecked && fp && (
                              <div className="grid grid-cols-3 gap-2 mt-2.5 pl-6">
                                <div>
                                  <label className="label text-xs mb-1">Floor From</label>
                                  <input className="input py-1.5 text-sm" type="number" min="1"
                                    placeholder="e.g. 3"
                                    value={fp.floorFrom ?? ""}
                                    onChange={e => updateTowerFloorPlan(tIdx, planIdx, "floorFrom",
                                      e.target.value ? parseInt(e.target.value, 10) : null)} />
                                </div>
                                <div>
                                  <label className="label text-xs mb-1">Floor To</label>
                                  <input className="input py-1.5 text-sm" type="number" min="1"
                                    placeholder="e.g. 45"
                                    value={fp.floorTo ?? ""}
                                    onChange={e => updateTowerFloorPlan(tIdx, planIdx, "floorTo",
                                      e.target.value ? parseInt(e.target.value, 10) : null)} />
                                </div>
                                <div>
                                  <label className="label text-xs mb-1">Units / Floor</label>
                                  <input className="input py-1.5 text-sm" type="number" min="1"
                                    placeholder="1"
                                    value={fp.unitsPerFloor}
                                    onChange={e => updateTowerFloorPlan(tIdx, planIdx, "unitsPerFloor",
                                      parseInt(e.target.value, 10) || 1)} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Unit Plans ── */}
      {tab === "unit_plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Unit Plans ({unitPlans.length})</p>
            <button type="button" onClick={addUnitPlan}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Add Plan
            </button>
          </div>
          {unitPlans.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
              <LayoutList className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No unit plans yet</p>
              <button type="button" onClick={addUnitPlan}
                className="text-xs text-brand-600 hover:text-brand-700 mt-1 font-medium">
                Add first plan
              </button>
            </div>
          )}
          {unitPlans.map((plan, idx) => (
            <UnitPlanCard
              key={idx}
              plan={plan}
              idx={idx}
              onRemove={() => removeUnitPlan(idx)}
              onUpdate={(field, value) => updateUnitPlan(idx, field, value)}
            />
          ))}
        </div>
      )}

      {/* ── Save ── */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Update Project" : "Create Project"}
        </button>
        <button type="button" onClick={() => router.push(redirectTo ?? "/admin/projects")}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Cancel
        </button>
        <span className="text-xs text-gray-400 ml-auto">All tabs are saved together</span>
      </div>
    </form>
  );
}

// ─── Unit Plan Card ───────────────────────────────────────────────────────────

interface UnitPlanCardProps {
  plan: UnitPlan;
  idx: number;
  onRemove: () => void;
  onUpdate: (field: keyof UnitPlan, value: string | number | boolean | null) => void;
}

function UnitPlanCard({ plan, idx, onRemove, onUpdate }: UnitPlanCardProps) {
  const [open, setOpen] = useState(true);

  const badge = [
    `${plan.bhk} BHK`,
    plan.maidRoom   ? "M"  : null,
    plan.homeOffice ? "HO" : null,
  ].filter(Boolean).join(" + ");

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
        <button type="button" onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-gray-600">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <span className="font-semibold text-sm text-gray-700 flex-1">
          {plan.planName || `Plan ${idx + 1}`}
          {plan.sizeSqft > 0 && (
            <span className="ml-2 text-xs text-gray-400 font-normal">
              {badge} · {plan.sizeSqft.toLocaleString()} sft{plan.facing ? ` · ${plan.facing}` : ""}
            </span>
          )}
        </span>
        <button type="button" onClick={onRemove}
          className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          <div>
            <label className="label">Plan Name</label>
            <input className="input" placeholder="e.g. Plan 1 – East"
              value={plan.planName} onChange={e => onUpdate("planName", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">BHK</label>
              <input className="input" type="number" min="1" max="10" value={plan.bhk}
                onChange={e => onUpdate("bhk", parseInt(e.target.value, 10) || 1)} />
            </div>
            <div>
              <label className="label">Size (sq ft)</label>
              <input className="input" type="number" min="0" placeholder="e.g. 7460"
                value={plan.sizeSqft || ""}
                onChange={e => onUpdate("sizeSqft", parseInt(e.target.value, 10) || 0)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Facing</label>
              <select className="input" value={plan.facing ?? ""}
                onChange={e => onUpdate("facing", (e.target.value as UnitFacing) || null)}>
                <option value="">— Select facing —</option>
                {FACING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={plan.maidRoom}
                  onChange={e => onUpdate("maidRoom", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-600" />
                <span className="text-sm text-gray-700">Maid Room (M)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={plan.homeOffice}
                  onChange={e => onUpdate("homeOffice", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-600" />
                <span className="text-sm text-gray-700">Home Office (HO)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              Floor Plan URL
              <span className="text-xs text-gray-400 font-normal">(PDF or image)</span>
            </label>
            <div className="flex gap-2">
              <input className="input flex-1" type="url" placeholder="https://…"
                value={plan.planUrl ?? ""}
                onChange={e => onUpdate("planUrl", e.target.value || null)} />
              {plan.planUrl && (
                <a href={plan.planUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-brand-600 hover:border-brand-300 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
