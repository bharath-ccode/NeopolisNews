"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingUp, Loader2, Plus, Trash2 } from "lucide-react";

interface TrendRow {
  id: string;
  period: string;
  period_date: string;
  segment: "residential" | "office" | "retail";
  price: number;
  note: string | null;
}

const SEGMENT_LABELS = {
  residential: "Residential (₹/sq ft)",
  office:      "Office (₹/sq ft/mo)",
  retail:      "Retail (₹/sq ft/mo)",
} as const;

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

export default function AdminPriceTrendsPage() {
  const [rows, setRows]       = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const [period, setPeriod]     = useState("");
  const [periodDate, setPeriodDate] = useState("");
  const [segment, setSegment]   = useState<TrendRow["segment"]>("residential");
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
      body: JSON.stringify({ period, period_date: periodDate, segment, price: Number(price) }),
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-500" /> Price Trends
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Quarterly data shown on /real-estate#prices. Same period + segment overwrites.
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={add} className="card p-5 grid sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Period label</label>
          <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)}
            placeholder="Q1 2026" maxLength={20} className={INPUT} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Period start</label>
          <input type="date" value={periodDate} onChange={(e) => setPeriodDate(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Segment</label>
          <select value={segment} onChange={(e) => setSegment(e.target.value as TrendRow["segment"])} className={INPUT}>
            {Object.entries(SEGMENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Price (₹)</label>
          <input type="number" min={1} step="any" value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="10800" className={INPUT} />
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center justify-center gap-1.5 btn-primary text-sm py-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {/* Data table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">Period</th>
                <th className="px-4 py-3 font-semibold">Segment</th>
                <th className="px-4 py-3 font-semibold text-right">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2.5 font-semibold text-gray-800">{r.period}</td>
                  <td className="px-4 py-2.5 text-gray-500 capitalize">{r.segment}</td>
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
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No data yet — the public page shows fallback numbers until you add rows.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
