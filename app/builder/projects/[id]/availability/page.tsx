"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, PlusCircle, Tag, Loader2, AlertCircle,
  X, CheckCircle, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { getProjectById, type Project } from "@/lib/projectsStore";
import {
  getAnnouncementsByProject,
  createAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
  type Announcement,
  type AnnouncementStatus,
} from "@/lib/announcementsStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  active:           "Active",
  closed:           "Closed",
  pending_approval: "Pending",
};

const STATUS_COLORS: Record<AnnouncementStatus, string> = {
  active:           "bg-green-100 text-green-700",
  closed:           "bg-gray-100 text-gray-500",
  pending_approval: "bg-yellow-100 text-yellow-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AvailabilityPage() {
  const { builder }  = useBuilderAuth();
  const router       = useRouter();
  const { id }       = useParams<{ id: string }>();

  const [project, setProject]             = useState<Project | null | undefined>(undefined);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingData, setLoadingData]     = useState(true);
  const [showForm, setShowForm]           = useState(false);

  // Form state
  const [unitPlanId, setUnitPlanId]       = useState("");
  const [towerId, setTowerId]             = useState("");
  const [floorFrom, setFloorFrom]         = useState("");
  const [floorTo, setFloorTo]             = useState("");
  const [unitsAvailable, setUnitsAvailable] = useState("");
  const [pricePerSqft, setPricePerSqft]   = useState("");
  const [message, setMessage]             = useState("");
  const [validUntil, setValidUntil]       = useState("");
  const [saving, setSaving]               = useState(false);
  const [formError, setFormError]         = useState("");

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoadingData(true);
    const [proj, anns] = await Promise.all([
      getProjectById(id),
      getAnnouncementsByProject(id),
    ]);
    setProject(proj);
    setAnnouncements(anns);
    setLoadingData(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (project === undefined || loadingData) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>;
  }

  if (!project || project.builderId !== builder?.id) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        Project not found or access denied.
      </div>
    );
  }

  const towers    = project.projectDetail?.towers ?? [];
  const unitPlans = project.unitPlans ?? [];

  function resetForm() {
    setUnitPlanId(""); setTowerId(""); setFloorFrom(""); setFloorTo("");
    setUnitsAvailable(""); setPricePerSqft(""); setMessage(""); setValidUntil("");
    setFormError("");
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!unitPlanId) { setFormError("Please select a unit plan."); return; }
    if (!towerId)    { setFormError("Please select a tower."); return; }
    setSaving(true);
    try {
      await createAnnouncement({
        projectId:      project!.id,
        unitPlanId:     unitPlanId || null,
        towerId:        towerId    || null,
        floorFrom:      floorFrom      ? parseInt(floorFrom, 10)      : null,
        floorTo:        floorTo        ? parseInt(floorTo, 10)        : null,
        unitsAvailable: unitsAvailable ? parseInt(unitsAvailable, 10) : null,
        pricePerSqft:   pricePerSqft   ? parseFloat(pricePerSqft)     : null,
        message:        message.trim() || null,
        validUntil:     validUntil     || null,
        status:         "active",
      });
      resetForm();
      setShowForm(false);
      await loadData();
    } catch {
      setFormError("Failed to post announcement. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleClose(annId: string) {
    await updateAnnouncementStatus(annId, "closed");
    await loadData();
  }

  async function handleDelete(annId: string) {
    await deleteAnnouncement(annId);
    await loadData();
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  const activeCount = announcements.filter(a => a.status === "active").length;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" />
            <h1 className="text-xl font-extrabold text-gray-900">Availability</h1>
            {activeCount > 0 && (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                {activeCount} active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5 truncate">
            {project.projectName}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors shrink-0">
            <PlusCircle className="w-4 h-4" /> Post Availability
          </button>
        )}
      </div>

      {/* New Announcement Form */}
      {showForm && (
        <div className="card p-5 space-y-4 border-green-200 ring-1 ring-green-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">New Availability Announcement</h2>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Unit Plan <span className="text-red-500">*</span>
                </label>
                <select className={inputCls} value={unitPlanId}
                  onChange={e => setUnitPlanId(e.target.value)} required>
                  <option value="">— Select unit plan —</option>
                  {unitPlans.map(u => (
                    <option key={u.id} value={u.id!}>
                      {u.planName} ({u.bhk} BHK
                      {u.maidRoom ? " + M" : ""}
                      {u.homeOffice ? " + HO" : ""}
                      {" · "}{u.sizeSqft.toLocaleString()} sft
                      {u.facing ? ` · ${u.facing}` : ""})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Tower <span className="text-red-500">*</span>
                </label>
                <select className={inputCls} value={towerId}
                  onChange={e => setTowerId(e.target.value)} required>
                  <option value="">— Select tower —</option>
                  {towers.map(t => (
                    <option key={t.id} value={t.id!}>{t.towerName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Floor From</label>
                <input className={inputCls} type="number" min="1" placeholder="e.g. 10"
                  value={floorFrom} onChange={e => setFloorFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Floor To</label>
                <input className={inputCls} type="number" min="1" placeholder="e.g. 20"
                  value={floorTo} onChange={e => setFloorTo(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Units Available</label>
                <input className={inputCls} type="number" min="1" placeholder="e.g. 12"
                  value={unitsAvailable} onChange={e => setUnitsAvailable(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Price per sq ft (₹) <span className="text-gray-400 font-normal">optional</span>
                </label>
                <input className={inputCls} type="number" min="0" step="0.01" placeholder="e.g. 14500"
                  value={pricePerSqft} onChange={e => setPricePerSqft(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Message <span className="text-gray-400 font-normal">optional</span>
              </label>
              <textarea className={inputCls} rows={3} placeholder="e.g. Limited units on offer this week. Pre-launch price extended till April 30."
                value={message} onChange={e => setMessage(e.target.value)} maxLength={500} />
              <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Valid Until <span className="text-gray-400 font-normal">optional — leave blank for open-ended</span>
              </label>
              <input className={inputCls} type="date" value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                min={new Date().toISOString().split("T")[0]} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Publish Announcement
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Announcements */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="card p-10 text-center">
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-medium text-gray-500 text-sm">No announcements yet</p>
            <p className="text-xs text-gray-400 mt-1">Post availability to let buyers know what units are available and at what price.</p>
          </div>
        ) : (
          announcements.map(ann => (
            <AnnouncementCard
              key={ann.id}
              ann={ann}
              onClose={() => handleClose(ann.id)}
              onDelete={() => handleDelete(ann.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Announcement Card ────────────────────────────────────────────────────────

function AnnouncementCard({
  ann, onClose, onDelete,
}: {
  ann: Announcement;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className={`card p-4 space-y-3 ${ann.status === "closed" ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Unit plan + tower */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 text-sm">
              {ann.unitPlanSummary ?? ann.unitPlanName ?? "Unit"}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-600 font-medium">{ann.towerName ?? "Tower"}</span>
          </div>
          {/* Floor + units + price */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {(ann.floorFrom || ann.floorTo) && (
              <span>
                Floors {ann.floorFrom ?? "–"}{ann.floorTo && ann.floorTo !== ann.floorFrom ? ` – ${ann.floorTo}` : ""}
              </span>
            )}
            {ann.unitsAvailable != null && (
              <span className="text-green-700 font-semibold">{ann.unitsAvailable} units available</span>
            )}
            {ann.pricePerSqft != null && (
              <span className="text-brand-700 font-semibold">₹{ann.pricePerSqft.toLocaleString()}/sft</span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[ann.status]}`}>
          {STATUS_LABELS[ann.status]}
        </span>
      </div>

      {/* Message (expandable) */}
      {ann.message && (
        <div>
          <p className={`text-sm text-gray-600 ${expanded ? "" : "line-clamp-2"}`}>{ann.message}</p>
          {ann.message.length > 100 && (
            <button onClick={() => setExpanded(e => !e)}
              className="text-xs text-brand-600 hover:text-brand-700 mt-0.5 flex items-center gap-0.5">
              {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          Posted {new Date(ann.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          {ann.validUntil && (
            <> · Valid until {new Date(ann.validUntil + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</>
          )}
        </span>
        <div className="flex items-center gap-2">
          {ann.status === "active" && (
            <button onClick={onClose}
              className="text-xs text-gray-400 hover:text-orange-600 font-medium transition-colors">
              Close
            </button>
          )}
          {confirmDel ? (
            <div className="flex items-center gap-1">
              <button onClick={onDelete}
                className="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-medium hover:bg-red-700">
                Delete
              </button>
              <button onClick={() => setConfirmDel(false)}
                className="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
