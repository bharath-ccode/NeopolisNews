"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp, Loader2, Plus, Trash2, MapPin } from "lucide-react";
import {
  LOCALITIES, LIFECYCLE_STAGES,
  type Locality, type ProjectTier, type LifecycleStatus,
} from "@/lib/projectsStore";

interface TrendRow {
  id: string;
  locality: Locality;
  tier: ProjectTier;
  lifecycle_status: LifecycleStatus;
  price: number;
}

const TIER_META: Record<ProjectTier, { label: string; cls: string }> = {
  affordable:  { label: "Affordable",  cls: "tag-green"  },
  premium:     { label: "Premium",     cls: "tag-blue"   },
  luxury:      { label: "Luxury",      cls: "tag-purple" },
  uber_luxury: { label: "Uber Luxury", cls: "tag-purple" },
};

const TIERS = Object.keys(TIER_META) as ProjectTier[];

// Pre-Launch excluded — quoting a price before RERA registration isn't legal.
const PRICEABLE_STAGES = LIFECYCLE_STAGES.filter((s) => s.id !== "pre_launch");

const STAGE_LABELS: Record<LifecycleStatus, string> = Object.fromEntries(
  LIFECYCLE_STAGES.map((s) => [s.id, s.label])
) as Record<LifecycleStatus, string>;

const STAGE_CLS: Record<LifecycleStatus, string> = {
  pre_launch:         "tag-blue",
  rera_registered:    "tag-blue",
  under_construction: "tag-orange",
  structure_complete: "tag-orange",
  finishing:          "tag-orange",
  oc_received:        "tag-green",
  ready_to_move:      "tag-green",
};

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

export default function AdminPriceTrendsPage() {
  const [rows, setRows]       = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const [locality, setLocality] = useState<Locality>(LOCALITIES[0]);
  const [tier, setTier]         = useState<ProjectTier>("premium");
  const [stage, setStage]       = useState<LifecycleStatus>(PRICEABLE_STAGES[0].id);
  const [price, setPrice]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/price-trends").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setRows(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/price-trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locality, tier, lifecycle_status: stage, price: Number(price) }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to save.");
    } else {
      setPrice("");
      load();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/price-trends?id=${id}`, { method: "DELETE" }).catch(() => null);
  }

  const grouped = useMemo(() => {
    const byLocality = new Map<Locality, TrendRow[]>();
    for (const r of rows) {
      const list = byLocality.get(r.locality) ?? [];
      list.push(r);
      byLocality.set(r.locality, list);
    }
    return LOCALITIES
      .filter((l) => byLocality.has(l))
      .map((l) => ({ locality: l, rows: byLocality.get(l)! }));
  }, [rows]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-500" /> Price Trends
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          ₹/sq ft by Locality × Tier × Construction Stage — shown on /real-estate#prices.
          Same combination overwrites.
        </p>
      </div>

      {/* Add / update form */}
      <form onSubmit={add} className="card p-5 grid sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Locality</label>
          <select value={locality} onChange={(e) => setLocality(e.target.value as Locality)} className={INPUT}>
            {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tier</label>
          <select value={tier} onChange={(e) => setTier(e.target.value as ProjectTier)} className={INPUT}>
            {TIERS.map((t) => <option key={t} value={t}>{TIER_META[t].label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Construction Stage</label>
          <select value={stage} onChange={(e) => setStage(e.target.value as LifecycleStatus)} className={INPUT}>
            {PRICEABLE_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Price (₹/sq ft)</label>
          <input type="number" min={1} step="any" value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="9800" className={INPUT} />
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center justify-center gap-1.5 btn-primary text-sm py-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {/* Grouped by Locality */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="card p-10 text-center text-gray-400 text-sm">
          No combinations yet — add one above. The public page shows fallback
          numbers until at least one is saved.
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ locality: loc, rows: localityRows }) => (
            <div key={loc} className="card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <MapPin className="w-4 h-4 text-brand-500" />
                <h3 className="font-bold text-gray-900 text-sm">{loc}</h3>
                <span className="text-xs text-gray-400">
                  {localityRows.length} combination{localityRows.length !== 1 ? "s" : ""}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-2.5 font-semibold">Tier</th>
                    <th className="px-4 py-2.5 font-semibold">Construction Stage</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Price</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {localityRows.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2.5">
                        <span className={`badge text-xs ${TIER_META[r.tier].cls}`}>
                          {TIER_META[r.tier].label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`badge text-xs ${STAGE_CLS[r.lifecycle_status]}`}>
                          {STAGE_LABELS[r.lifecycle_status]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-800">
                        ₹{Number(r.price).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
