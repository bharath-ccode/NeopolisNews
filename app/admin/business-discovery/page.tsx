"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search, Loader2, RefreshCw, CheckCircle, XCircle, Star, Globe, Phone,
  MapPin, AlertTriangle, ChevronDown, ChevronUp, ListTree, Check, Minus, CheckCheck,
  Trash2, PlusCircle,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ALL_INDUSTRIES, DISCOVERY_LOCALITIES, resolveIndustryConfig, subtypeKey } from "@/lib/businessDiscovery";
import type { DiscoveryIndustryConfig } from "@/lib/businessDiscovery";

interface Candidate {
  id: string;
  place_id: string;
  name: string;
  industry: string;
  business_type: string;
  subtype: string;
  locality: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  rating: number | null;
  rating_count: number | null;
  status: "pending" | "approved" | "rejected";
  change_summary: string | null;
}

interface PlaceResult {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  hoursRaw: string[];
  rating: number | null;
  ratingCount: number | null;
  lat: number | null;
  lng: number | null;
}

type Tab = "pending" | "approved" | "rejected";

const INPUT = "w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

function CandidateCard({
  c, onApprove, onReject, busy,
}: {
  c: Candidate;
  onApprove: (id: string, fields: Record<string, string>) => void;
  onReject: (id: string) => void;
  busy: boolean;
}) {
  const [name, setName] = useState(c.name);
  const [phone, setPhone] = useState(c.phone ?? "");
  const [email, setEmail] = useState(c.email ?? "");
  const [address, setAddress] = useState(c.address ?? "");

  return (
    <div className="card p-5 space-y-3">
      {c.change_summary && (
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {c.change_summary}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge text-xs tag-green">{c.industry}</span>
            <span className="badge text-xs tag-blue">{c.business_type}</span>
            <span className="badge text-xs tag-purple">{c.subtype}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3" /> {c.locality}
            </span>
          </div>
          {c.rating !== null && (
            <span className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {c.rating} ({c.rating_count ?? 0})
            </span>
          )}
        </div>
        {c.website && (
          <a href={c.website} target="_blank" rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-xs text-brand-600 hover:underline">
            <Globe className="w-3.5 h-3.5" /> Website
          </a>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Name</label>
          <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            Phone {c.phone && <span className="text-gray-300 font-normal">(from Google)</span>}
          </label>
          <input className={INPUT} value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+91…" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            Email <span className="text-gray-300 font-normal">(not on Google — fill in manually)</span>
          </label>
          <input className={INPUT} value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="business@example.com" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Address</label>
          <input className={INPUT} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>

      {c.phone && (
        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-gray-400">
          <Phone className="w-3 h-3" /> {c.phone}
        </a>
      )}

      {c.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onApprove(c.id, { name, phone, email, address })}
            disabled={busy}
            className="flex items-center gap-1.5 btn-primary text-sm py-2 disabled:opacity-60"
          >
            <CheckCircle className="w-4 h-4" /> Approve & Publish
          </button>
          <button
            onClick={() => onReject(c.id)}
            disabled={busy}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 px-4 py-2 rounded-lg border border-gray-200 hover:border-red-200 transition-colors disabled:opacity-60"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      )}
    </div>
  );
}

type ChipState = "checked" | "partial" | "unchecked";
// Matches the industry/type/subtype badge colors already used on the
// candidate cards below (tag-green/tag-blue/tag-purple) so the same
// level reads as the same color everywhere on this page.
type ChipLevel = "industry" | "type" | "subtype" | "locality";

const CHIP_COLORS: Record<ChipLevel, { checked: string; partial: string }> = {
  industry: { checked: "bg-green-600 border-green-600 text-white",   partial: "bg-green-50 border-green-300 text-green-700" },
  type:     { checked: "bg-blue-600 border-blue-600 text-white",     partial: "bg-blue-50 border-blue-300 text-blue-700" },
  subtype:  { checked: "bg-purple-600 border-purple-600 text-white", partial: "bg-purple-50 border-purple-300 text-purple-700" },
  locality: { checked: "bg-brand-600 border-brand-600 text-white",   partial: "bg-brand-50 border-brand-300 text-brand-700" },
};

function Chip({ state, label, onClick, title, level = "locality" }: { state: ChipState; label: string; onClick: () => void; title?: string; level?: ChipLevel }) {
  const colors = CHIP_COLORS[level];
  const styles =
    state === "checked" ? colors.checked
    : state === "partial" ? colors.partial
    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${styles}`}
    >
      {state === "checked" && <Check className="w-3 h-3" />}
      {state === "partial" && <Minus className="w-3 h-3" />}
      {label}
    </button>
  );
}

function chipState(selected: number, total: number): ChipState {
  if (selected === 0) return "unchecked";
  return selected === total ? "checked" : "partial";
}

// ─── Step labels ────────────────────────────────────────────────────────────

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
      <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">
        {n}
      </span>
      {children}
    </p>
  );
}

// ─── Step 3a: bulk search — select type & subtype ──────────────────────────────

function TypeSubtypePicker({
  industryConfig, selectedKeys, setSelectedKeys, selectedLocality,
}: {
  industryConfig: DiscoveryIndustryConfig;
  selectedKeys: Set<string>;
  setSelectedKeys: (updater: (prev: Set<string>) => Set<string>) => void;
  selectedLocality: string;
}) {
  const [open, setOpen] = useState(true);
  const totalSearches = selectedKeys.size;

  function toggleKeys(keys: string[]) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const allSelected = keys.every((k) => next.has(k));
      for (const k of keys) {
        if (allSelected) next.delete(k); else next.add(k);
      }
      return next;
    });
  }

  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ListTree className="w-4 h-4 text-brand-500" />
          Bulk search — {selectedKeys.size} subtypes selected in &quot;{selectedLocality}&quot; ({totalSearches} searches)
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
          {industryConfig.types.map((t) => {
            const typeKeys = t.subtypes.map((s) => subtypeKey(industryConfig.industry, t.type, s.subtype));
            const typeSelected = typeKeys.filter((k) => selectedKeys.has(k)).length;
            const state = chipState(typeSelected, typeKeys.length);
            return (
              <div key={t.type} className="border border-gray-200 rounded-xl p-3.5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => toggleKeys(typeKeys)}
                  className={`flex items-center gap-1.5 font-bold text-sm transition-colors ${
                    state === "checked" ? "text-blue-700" : state === "partial" ? "text-blue-600" : "text-gray-900 hover:text-blue-700"
                  }`}
                >
                  {state === "checked" && <Check className="w-4 h-4 shrink-0" />}
                  {state === "partial" && <Minus className="w-4 h-4 shrink-0" />}
                  {t.type}
                  <span className="text-xs font-normal text-gray-400">({typeSelected}/{typeKeys.length})</span>
                </button>
                <div className="flex flex-wrap gap-1.5 pl-0.5">
                  {t.subtypes.map((s) => {
                    const key = subtypeKey(industryConfig.industry, t.type, s.subtype);
                    return (
                      <Chip
                        key={key}
                        state={selectedKeys.has(key) ? "checked" : "unchecked"}
                        label={s.subtype}
                        onClick={() => toggleKeys([key])}
                        title={`Google query term: "${s.queryTerm}"`}
                        level="subtype"
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Step 3b: search by name — look up one business, pick the right result ────

function SearchByName({
  industryConfig, adminEmail, onAdded,
}: {
  industryConfig: DiscoveryIndustryConfig;
  adminEmail?: string;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classification, setClassification] = useState<Record<string, { type: string; subtype: string }>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || searching) return;
    setSearching(true);
    setError(null);
    setResults([]);
    setSearched(true);
    const res = await fetch("/api/admin/business-discovery/search-by-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.trim() }),
    }).catch(() => null);
    if (res?.ok) {
      setResults(await res.json());
    } else {
      const err = await res?.json().catch(() => null);
      setError(err?.error ?? "Search failed — check server logs.");
    }
    setSearching(false);
  }

  async function handleAdd(place: PlaceResult) {
    const cls = classification[place.placeId];
    if (!cls?.type || !cls?.subtype) return;
    setAddingId(place.placeId);
    const res = await fetch("/api/admin/business-discovery/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place, industry: industryConfig.industry, type: cls.type, subtype: cls.subtype, reviewedBy: adminEmail,
      }),
    }).catch(() => null);
    if (res?.ok) {
      setAddedIds((prev) => new Set(prev).add(place.placeId));
      onAdded();
    } else {
      const err = await res?.json().catch(() => null);
      alert(err?.error ?? "Failed to add. Please try again.");
    }
    setAddingId(null);
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Search className="w-4 h-4 text-brand-500" /> Search by name — look up one business, add the correct match
      </p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Business name in ${industryConfig.industry}…`}
          className={INPUT}
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="flex items-center gap-1.5 btn-primary text-sm py-2 px-4 shrink-0 disabled:opacity-60"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {searched && !searching && !error && results.length === 0 && (
        <p className="text-sm text-gray-400">No results from Google Places for that name.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((p) => {
            const cls = classification[p.placeId];
            const typeOptions = industryConfig.types;
            const subtypeOptions = typeOptions.find((t) => t.type === cls?.type)?.subtypes ?? [];
            const added = addedIds.has(p.placeId);
            return (
              <div key={p.placeId} className="border border-gray-200 rounded-xl p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                    {p.address && <p className="text-xs text-gray-500 truncate">{p.address}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                      {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</span>}
                      {p.rating !== null && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {p.rating} ({p.ratingCount ?? 0})
                        </span>
                      )}
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-600 hover:underline">
                          <Globe className="w-3 h-3" /> Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {added ? (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                    <CheckCircle className="w-3.5 h-3.5" /> Added — live and searchable now
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <select
                      value={cls?.type ?? ""}
                      onChange={(e) => setClassification((prev) => ({ ...prev, [p.placeId]: { type: e.target.value, subtype: "" } }))}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    >
                      <option value="">Type…</option>
                      {typeOptions.map((t) => <option key={t.type} value={t.type}>{t.type}</option>)}
                    </select>
                    <select
                      value={cls?.subtype ?? ""}
                      disabled={!cls?.type}
                      onChange={(e) => setClassification((prev) => ({ ...prev, [p.placeId]: { type: prev[p.placeId]?.type ?? "", subtype: e.target.value } }))}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50"
                    >
                      <option value="">Subtype…</option>
                      {subtypeOptions.map((s) => <option key={s.subtype} value={s.subtype}>{s.subtype}</option>)}
                    </select>
                    <button
                      onClick={() => handleAdd(p)}
                      disabled={!cls?.type || !cls?.subtype || addingId === p.placeId}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {addingId === p.placeId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                      Add
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <p className="text-xs text-gray-400">
            Only the result you add is kept — the rest are just search results, nothing else is saved.
          </p>
        </div>
      )}
    </div>
  );
}

export default function BusinessDiscoveryPage() {
  const { admin } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("pending");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async (t: Tab, ind: string | null) => {
    setLoading(true);
    const qs = new URLSearchParams({ status: t });
    if (ind) qs.set("industry", ind);
    const res = await fetch(`/api/admin/business-discovery/list?${qs.toString()}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setCandidates(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(tab, selectedIndustry); }, [tab, selectedIndustry, load]);

  function pickIndustry(ind: string) {
    setSelectedIndustry((prev) => (prev === ind ? null : ind));
    setSelectedKeys(new Set());
  }

  const industryConfig = selectedIndustry ? resolveIndustryConfig(selectedIndustry) : null;

  const canRun = selectedKeys.size > 0 && selectedLocality !== null;

  async function runDiscovery() {
    if (!canRun || !selectedLocality) return;
    setRunning(true);
    setRunResult(null);
    const res = await fetch("/api/admin/business-discovery/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subtypeKeys: Array.from(selectedKeys),
        localities: [selectedLocality],
      }),
    }).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      setRunResult(`${json.newCandidates} new · ${json.changedCandidates} changed · ${json.queried} searches run`);
      load(tab, selectedIndustry);
    } else {
      const err = await res?.json().catch(() => null);
      setRunResult(err?.error ?? "Run failed — check server logs.");
    }
    setRunning(false);
  }

  async function approveOne(id: string, fields: Record<string, string>): Promise<boolean> {
    const res = await fetch(`/api/admin/business-discovery/approve/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, reviewedBy: admin?.email }),
    }).catch(() => null);
    if (res?.ok) {
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
    return false;
  }

  async function approve(id: string, fields: Record<string, string>) {
    setBusyId(id);
    await approveOne(id, fields);
    setBusyId(null);
  }

  async function approveAll() {
    const pending = candidates.filter((c) => c.status === "pending");
    if (pending.length === 0) return;
    setBulkApproving(true);
    setBulkProgress({ done: 0, total: pending.length });
    let failed = 0;
    for (let i = 0; i < pending.length; i++) {
      const ok = await approveOne(pending[i].id, {
        name: pending[i].name,
        phone: pending[i].phone ?? "",
        email: pending[i].email ?? "",
        address: pending[i].address ?? "",
      });
      if (!ok) failed++;
      setBulkProgress({ done: i + 1, total: pending.length });
    }
    setRunResult(
      failed > 0
        ? `Approved ${pending.length - failed} of ${pending.length} — ${failed} failed, still pending.`
        : `Approved all ${pending.length} pending listings — live and searchable now.`
    );
    setBulkApproving(false);
    setBulkProgress(null);
  }

  async function reject(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/business-discovery/reject/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewedBy: admin?.email }),
    }).catch(() => null);
    if (res?.ok) setCandidates((prev) => prev.filter((c) => c.id !== id));
    setBusyId(null);
  }

  async function clearAllResults() {
    if (!confirm("Clear ALL discovery results — pending, approved, and rejected? This only empties the review queue; businesses already added are not affected. This can't be undone.")) return;
    setClearing(true);
    const res = await fetch("/api/admin/business-discovery/clear", { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setCandidates([]);
      setRunResult("Cleared all discovery results.");
    } else {
      alert("Failed to clear. Please try again.");
    }
    setClearing(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-4.5 h-4.5 text-brand-500" /> Business Discovery
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Google Places search by industry, type &amp; locality, staged here for review before publishing.
          </p>
        </div>
        <button
          onClick={clearAllResults}
          disabled={clearing}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 px-3.5 py-2 rounded-lg border border-gray-200 hover:border-red-200 transition-colors disabled:opacity-60"
        >
          {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Clear All Results
        </button>
      </div>

      {/* Step 1 — industry */}
      <div className="card p-4 space-y-2">
        <StepLabel n={1}>Choose an industry</StepLabel>
        <div className="flex flex-wrap gap-1.5">
          {ALL_INDUSTRIES.map((ind) => (
            <Chip
              key={ind}
              state={selectedIndustry === ind ? "checked" : "unchecked"}
              label={ind}
              onClick={() => pickIndustry(ind)}
              level="industry"
            />
          ))}
        </div>
      </div>

      {/* Step 2 — locality */}
      {industryConfig && (
        <div className="card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <StepLabel n={2}>Choose a locality</StepLabel>
            {selectedLocality && (
              <button
                type="button"
                onClick={() => setSelectedLocality(null)}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DISCOVERY_LOCALITIES.map((loc) => (
              <Chip
                key={loc}
                state={selectedLocality === loc ? "checked" : "unchecked"}
                label={loc}
                onClick={() => setSelectedLocality(selectedLocality === loc ? null : loc)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — search */}
      {industryConfig && selectedLocality && (
        <>
          <StepLabel n={3}>Search by name, or select type &amp; subtype for a bulk search</StepLabel>

          <SearchByName
            industryConfig={industryConfig}
            adminEmail={admin?.email}
            onAdded={() => load(tab, selectedIndustry)}
          />

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={runDiscovery}
              disabled={running || !canRun}
              title={canRun ? undefined : "Select at least one type/subtype above to enable this"}
              className="flex items-center gap-1.5 btn-primary text-sm py-2 disabled:opacity-60"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Run Discovery Now
            </button>
          </div>

          <TypeSubtypePicker
            industryConfig={industryConfig}
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            selectedLocality={selectedLocality}
          />
        </>
      )}

      {runResult && (
        <p className="text-sm text-brand-700 bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5">
          {runResult}
        </p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 w-fit">
          {(["pending", "approved", "rejected"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
                tab === t ? "bg-white text-brand-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "pending" && candidates.length > 0 && (
          <button
            onClick={approveAll}
            disabled={bulkApproving}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {bulkApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            {bulkApproving && bulkProgress
              ? `Approving ${bulkProgress.done}/${bulkProgress.total}…`
              : `Approve All (${candidates.length})`}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="card p-10 text-center text-gray-400 text-sm">
          {tab === "pending"
            ? "Nothing to review. Search above to find new listings."
            : `No ${tab} candidates yet.`}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              c={c}
              busy={busyId === c.id || bulkApproving}
              onApprove={approve}
              onReject={reject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
