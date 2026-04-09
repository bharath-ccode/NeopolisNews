"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Building2,
  Phone,
  Globe,
  Users,
  Layers,
  Upload,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { getBuilders, type Builder } from "@/lib/buildersStore";
import {
  createProject,
  updateProject,
  type Project,
  type ProjectInput,
  type ContactPhone,
  type Tower,
  type FloorPlan,
} from "@/lib/projectsStore";

// ─── Default shapes ───────────────────────────────────────────────────────────

const emptyPhone = (): ContactPhone => ({ phoneNumber: "", role: "sales", sortOrder: 0 });
const emptyFloorPlan = (): FloorPlan => ({ imageUrl: "", floorLabel: "", sortOrder: 0 });
const emptyTower = (idx: number): Tower => ({
  towerName: `Tower ${idx + 1}`,
  numFloors: 1,
  sortOrder: idx,
  floorPlans: [],
});

const PHONE_ROLES: { value: ContactPhone["role"]; label: string }[] = [
  { value: "sales", label: "Sales" },
  { value: "service", label: "Service" },
  { value: "front_desk", label: "Front Desk" },
];

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "info" | "contacts" | "details";

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectFormProps {
  initialData?: Project;
}

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("info");
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Form state ──
  const [projectName, setProjectName] = useState(initialData?.projectName ?? "");
  const [builderId, setBuilderId] = useState(initialData?.builderId ?? "");
  const [totalLandArea, setTotalLandArea] = useState(
    initialData?.totalLandAreaAcres?.toString() ?? ""
  );
  const [totalUnits, setTotalUnits] = useState(
    initialData?.totalUnits?.toString() ?? ""
  );
  const [coreNeopolis, setCoreNeopolis] = useState(initialData?.coreNeopolis ?? false);
  const [projectLogoUrl, setProjectLogoUrl] = useState<string | null>(
    initialData?.projectLogoUrl ?? null
  );

  // Contact
  const [contactEmail, setContactEmail] = useState(initialData?.contact?.email ?? "");
  const [contactWebsite, setContactWebsite] = useState(initialData?.contact?.website ?? "");
  const [projectOwner, setProjectOwner] = useState(initialData?.contact?.projectOwner ?? "");
  const [facebookUrl, setFacebookUrl] = useState(initialData?.contact?.facebookUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initialData?.contact?.instagramUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.contact?.youtubeUrl ?? "");
  const [phones, setPhones] = useState<ContactPhone[]>(
    initialData?.contact?.phones?.length
      ? initialData.contact.phones
      : [emptyPhone()]
  );

  // Project details
  const [towers, setTowers] = useState<Tower[]>(
    initialData?.projectDetail?.towers?.length
      ? initialData.projectDetail.towers
      : [emptyTower(0)]
  );

  // Load builders list
  useEffect(() => {
    getBuilders().then(setBuilders).catch(() => {});
  }, []);

  const isEdit = !!initialData;

  // ── Phone helpers ──
  function addPhone() {
    if (phones.length >= 5) return;
    setPhones((p) => [...p, emptyPhone()]);
  }
  function removePhone(i: number) {
    setPhones((p) => p.filter((_, idx) => idx !== i));
  }
  function updatePhone(i: number, field: keyof ContactPhone, value: string) {
    setPhones((p) =>
      p.map((ph, idx) => (idx === i ? { ...ph, [field]: value } : ph))
    );
  }

  // ── Tower helpers ──
  function addTower() {
    setTowers((t) => [...t, emptyTower(t.length)]);
  }
  function removeTower(i: number) {
    setTowers((t) => t.filter((_, idx) => idx !== i));
  }
  function updateTower(i: number, field: keyof Tower, value: string | number) {
    setTowers((t) =>
      t.map((tw, idx) => (idx === i ? { ...tw, [field]: value } : tw))
    );
  }
  function addFloorPlan(towerIdx: number, url: string) {
    setTowers((t) =>
      t.map((tw, i) =>
        i === towerIdx
          ? { ...tw, floorPlans: [...tw.floorPlans, { ...emptyFloorPlan(), imageUrl: url }] }
          : tw
      )
    );
  }
  function removeFloorPlan(towerIdx: number, fpIdx: number) {
    setTowers((t) =>
      t.map((tw, i) =>
        i === towerIdx
          ? { ...tw, floorPlans: tw.floorPlans.filter((_, j) => j !== fpIdx) }
          : tw
      )
    );
  }
  function updateFloorPlan(towerIdx: number, fpIdx: number, field: keyof FloorPlan, value: string) {
    setTowers((t) =>
      t.map((tw, i) =>
        i === towerIdx
          ? {
              ...tw,
              floorPlans: tw.floorPlans.map((fp, j) =>
                j === fpIdx ? { ...fp, [field]: value } : fp
              ),
            }
          : tw
      )
    );
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) {
      setError("Project name is required.");
      setTab("info");
      return;
    }
    setError(null);
    setSaving(true);

    const input: ProjectInput = {
      projectName: projectName.trim(),
      builderId: builderId || null,
      totalLandAreaAcres: totalLandArea ? parseFloat(totalLandArea) : null,
      totalUnits: totalUnits ? parseInt(totalUnits, 10) : null,
      coreNeopolis,
      projectLogoUrl,
      contact: {
        email: contactEmail || null,
        website: contactWebsite || null,
        projectOwner: projectOwner || null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        youtubeUrl: youtubeUrl || null,
        phones: phones.filter((p) => p.phoneNumber.trim()),
      },
      projectDetail: {
        numTowers: towers.length,
        towers: towers.map((t, i) => ({
          ...t,
          sortOrder: i,
          floorPlans: t.floorPlans.filter((fp) => fp.imageUrl),
        })),
      },
    };

    try {
      if (isEdit) {
        await updateProject(initialData!.id, input);
      } else {
        await createProject(input);
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "info",     label: "Project Info", icon: Building2 },
    { key: "contacts", label: "Contacts",     icon: Users     },
    { key: "details",  label: "Details & Floor Plans", icon: Layers },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 gap-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? "border-brand-500 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Project Info ── */}
      {tab === "info" && (
        <div className="space-y-5">
          {/* Logo */}
          <div>
            <label className="label">Project Logo</label>
            <ImageUpload
              value={projectLogoUrl}
              onChange={setProjectLogoUrl}
              folder="projects/logos"
              label="Upload Logo"
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="label">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Neopolis Phase 2"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          {/* Builder */}
          <div>
            <label className="label">Builder</label>
            <select
              className="input"
              value={builderId}
              onChange={(e) => setBuilderId(e.target.value)}
            >
              <option value="">— Select a builder —</option>
              {builders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.builderName}
                </option>
              ))}
            </select>
            {builders.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No builders found.{" "}
                <a href="/admin/builders/create" target="_blank" className="underline">
                  Add one first
                </a>
                .
              </p>
            )}
          </div>

          {/* Land area + units */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Total Land Area (acres)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 100"
                value={totalLandArea}
                onChange={(e) => setTotalLandArea(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Total Units</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="e.g. 2500"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
              />
            </div>
          </div>

          {/* Core Neopolis */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={coreNeopolis}
              onChange={(e) => setCoreNeopolis(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
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
          {/* Owner */}
          <div>
            <label className="label">Project Owner</label>
            <input
              className="input"
              placeholder="Owner name or company"
              value={projectOwner}
              onChange={(e) => setProjectOwner(e.target.value)}
            />
          </div>

          {/* Email + Website */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="project@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Website</label>
              <input
                className="input"
                type="url"
                placeholder="https://project.com"
                value={contactWebsite}
                onChange={(e) => setContactWebsite(e.target.value)}
              />
            </div>
          </div>

          {/* Social media */}
          <div>
            <p className="label flex items-center gap-1.5 mb-3">
              <Globe className="w-3.5 h-3.5" /> Social Media
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-blue-600 w-20 shrink-0">Facebook</span>
                <input
                  className="input flex-1"
                  type="url"
                  placeholder="https://facebook.com/project"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-pink-600 w-20 shrink-0">Instagram</span>
                <input
                  className="input flex-1"
                  type="url"
                  placeholder="https://instagram.com/project"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-red-600 w-20 shrink-0">YouTube</span>
                <input
                  className="input flex-1"
                  type="url"
                  placeholder="https://youtube.com/@project"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Phone numbers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="label flex items-center gap-1.5 mb-0">
                <Phone className="w-3.5 h-3.5" /> Phone Numbers
                <span className="text-gray-400 font-normal">({phones.length}/5)</span>
              </p>
              {phones.length < 5 && (
                <button
                  type="button"
                  onClick={addPhone}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Number
                </button>
              )}
            </div>
            <div className="space-y-3">
              {phones.map((ph, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    className="input w-36 shrink-0"
                    value={ph.role}
                    onChange={(e) => updatePhone(i, "role", e.target.value)}
                  >
                    {PHONE_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input flex-1"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={ph.phoneNumber}
                    onChange={(e) => updatePhone(i, "phoneNumber", e.target.value)}
                  />
                  {phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(i)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Project Details ── */}
      {tab === "details" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Towers ({towers.length})
            </p>
            <button
              type="button"
              onClick={addTower}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add Tower
            </button>
          </div>

          {towers.map((tower, tIdx) => (
            <TowerCard
              key={tIdx}
              tower={tower}
              towerIdx={tIdx}
              canRemove={towers.length > 1}
              onRemove={() => removeTower(tIdx)}
              onUpdate={(field, value) => updateTower(tIdx, field, value)}
              onAddFloorPlan={(url) => addFloorPlan(tIdx, url)}
              onRemoveFloorPlan={(fpIdx) => removeFloorPlan(tIdx, fpIdx)}
              onUpdateFloorPlan={(fpIdx, field, value) =>
                updateFloorPlan(tIdx, fpIdx, field, value)
              }
            />
          ))}
        </div>
      )}

      {/* ── Save button ── */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Update Project" : "Create Project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          All sections are saved together
        </span>
      </div>
    </form>
  );
}

// ─── Tower Card ───────────────────────────────────────────────────────────────

interface TowerCardProps {
  tower: Tower;
  towerIdx: number;
  canRemove: boolean;
  onRemove: () => void;
  onUpdate: (field: keyof Tower, value: string | number) => void;
  onAddFloorPlan: (url: string) => void;
  onRemoveFloorPlan: (fpIdx: number) => void;
  onUpdateFloorPlan: (fpIdx: number, field: keyof FloorPlan, value: string) => void;
}

function TowerCard({
  tower,
  towerIdx,
  canRemove,
  onRemove,
  onUpdate,
  onAddFloorPlan,
  onRemoveFloorPlan,
  onUpdateFloorPlan,
}: TowerCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Tower header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-gray-400 hover:text-gray-600"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <span className="font-semibold text-sm text-gray-700 flex-1">
          {tower.towerName || `Tower ${towerIdx + 1}`}
        </span>
        <span className="text-xs text-gray-400">
          {tower.numFloors} floor{tower.numFloors !== 1 ? "s" : ""}
          {tower.floorPlans.length > 0 && ` · ${tower.floorPlans.length} plan${tower.floorPlans.length !== 1 ? "s" : ""}`}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="p-4 space-y-4">
          {/* Tower name + floors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tower Name</label>
              <input
                className="input"
                placeholder="e.g. Tower A"
                value={tower.towerName}
                onChange={(e) => onUpdate("towerName", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Number of Floors</label>
              <input
                className="input"
                type="number"
                min="1"
                value={tower.numFloors}
                onChange={(e) => onUpdate("numFloors", parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>

          {/* Floor plans */}
          <div>
            <p className="label mb-2 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Floor Plans
            </p>
            <div className="flex flex-wrap gap-3">
              {tower.floorPlans.map((fp, fpIdx) => (
                <div key={fpIdx} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fp.imageUrl}
                    alt={fp.floorLabel || `Plan ${fpIdx + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveFloorPlan(fpIdx)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <input
                    className="mt-1 w-24 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
                    placeholder="Label"
                    value={fp.floorLabel ?? ""}
                    onChange={(e) => onUpdateFloorPlan(fpIdx, "floorLabel", e.target.value)}
                  />
                </div>
              ))}

              {/* Upload new floor plan */}
              <FloorPlanUploadButton
                towerIdx={towerIdx}
                onUpload={onAddFloorPlan}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Floor Plan Upload Button ─────────────────────────────────────────────────

function FloorPlanUploadButton({
  towerIdx,
  onUpload,
}: {
  towerIdx: number;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const { uploadImage } = await import("@/lib/uploadUtils");
      const url = await uploadImage(file, `projects/floor-plans/tower-${towerIdx}`);
      onUpload(url);
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-500 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span className="text-xs font-medium">Add Plan</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
