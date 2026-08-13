"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search, Loader2, RefreshCw, CheckCircle, XCircle, Star, Globe, Phone,
  MapPin, AlertTriangle, Clock, ChevronDown, ChevronUp, ListTree, Check, Minus,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { DISCOVERY_INDUSTRIES, DISCOVERY_LOCALITIES, subtypeKey } from "@/lib/businessDiscovery";

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
  hours_raw: string[];
  rating: number | null;
  rating_count: number | null;
  status: "pending" | "approved" | "rejected";
  change_summary: string | null;
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

      {c.hours_raw.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Hours from Google — checked automatically, verify before approving
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            {c.hours_raw.map((h) => <span key={h}>{h}</span>)}
          </div>
        </div>
      )}

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

function Chip({ state, label, onClick, title }: { state: ChipState; label: string; onClick: () => void; title?: string }) {
  const styles =
    state === "checked" ? "bg-brand-600 border-brand-600 text-white"
    : state === "partial" ? "bg-brand-50 border-brand-300 text-brand-700"
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

function SearchPlan({
  selectedKeys, setSelectedKeys, selectedLocalities, setSelectedLocalities,
}: {
  selectedKeys: Set<string>;
  setSelectedKeys: (updater: (prev: Set<string>) => Set<string>) => void;
  selectedLocalities: Set<string>;
  setSelectedLocalities: (updater: (prev: Set<string>) => Set<string>) => void;
}) {
  const [open, setOpen] = useState(true);
  const totalSearches = selectedKeys.size * selectedLocalities.size;

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

  function toggleLocality(locality: string) {
    setSelectedLocalities((prev) => {
      const next = new Set(prev);
      if (next.has(locality)) next.delete(locality); else next.add(locality);
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
          Search plan — {selectedKeys.size} subtypes × {selectedLocalities.size} localities ({totalSearches} searches selected)
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-5 border-t border-gray-100 pt-4">
          {DISCOVERY_INDUSTRIES.map((ind) => {
            const industryKeys = ind.types.flatMap((t) => t.subtypes.map((s) => subtypeKey(ind.industry, t.type, s.subtype)));
            const industrySelected = industryKeys.filter((k) => selectedKeys.has(k)).length;
            return (
              <div key={ind.industry} className="space-y-2">
                <Chip
                  state={chipState(industrySelected, industryKeys.length)}
                  label={ind.industry}
                  onClick={() => toggleKeys(industryKeys)}
                  title="Toggle every type & subtype in this industry"
                />
                <div className="pl-1 space-y-1.5">
                  {ind.types.map((t) => {
                    const typeKeys = t.subtypes.map((s) => subtypeKey(ind.industry, t.type, s.subtype));
                    const typeSelected = typeKeys.filter((k) => selectedKeys.has(k)).length;
                    return (
                      <div key={t.type} className="flex flex-wrap items-center gap-1.5">
                        <Chip
                          state={chipState(typeSelected, typeKeys.length)}
                          label={t.type}
                          onClick={() => toggleKeys(typeKeys)}
                        />
                        {t.subtypes.map((s) => {
                          const key = subtypeKey(ind.industry, t.type, s.subtype);
                          return (
                            <Chip
                              key={key}
                              state={selectedKeys.has(key) ? "checked" : "unchecked"}
                              label={s.subtype}
                              onClick={() => toggleKeys([key])}
                              title={`Google query term: "${s.queryTerm}"`}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <MapPin className="w-3.5 h-3.5" /> Localities — none selected by default, pick before running
              </span>
              <button
                type="button"
                onClick={() => setSelectedLocalities((prev) => (prev.size === DISCOVERY_LOCALITIES.length ? new Set() : new Set(DISCOVERY_LOCALITIES)))}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                {selectedLocalities.size === DISCOVERY_LOCALITIES.length ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DISCOVERY_LOCALITIES.map((loc) => (
                <Chip
                  key={loc}
                  state={selectedLocalities.has(loc) ? "checked" : "unchecked"}
                  label={loc}
                  onClick={() => toggleLocality(loc)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessDiscoveryPage() {
  const { admin } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("pending");
  const [industry, setIndustry] = useState<string>("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [selectedLocalities, setSelectedLocalities] = useState<Set<string>>(new Set());

  const load = useCallback(async (t: Tab, ind: string) => {
    setLoading(true);
    const qs = new URLSearchParams({ status: t });
    if (ind !== "all") qs.set("industry", ind);
    const res = await fetch(`/api/admin/business-discovery/list?${qs.toString()}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setCandidates(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(tab, industry); }, [tab, industry, load]);

  const canRun = selectedKeys.size > 0 && selectedLocalities.size > 0;

  async function runDiscovery() {
    if (!canRun) return;
    setRunning(true);
    setRunResult(null);
    const res = await fetch("/api/admin/business-discovery/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subtypeKeys: Array.from(selectedKeys),
        localities: Array.from(selectedLocalities),
      }),
    }).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      setRunResult(`${json.newCandidates} new · ${json.changedCandidates} changed · ${json.queried} searches run`);
      load(tab, industry);
    } else {
      const err = await res?.json().catch(() => null);
      setRunResult(err?.error ?? "Run failed — check server logs.");
    }
    setRunning(false);
  }

  async function approve(id: string, fields: Record<string, string>) {
    setBusyId(id);
    const res = await fetch(`/api/admin/business-discovery/approve/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, reviewedBy: admin?.email }),
    }).catch(() => null);
    if (res?.ok) setCandidates((prev) => prev.filter((c) => c.id !== id));
    setBusyId(null);
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
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={runDiscovery}
            disabled={running || !canRun}
            title={canRun ? undefined : "Select at least one type/subtype and one locality below to enable this"}
            className="flex items-center gap-1.5 btn-primary text-sm py-2 disabled:opacity-60"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Run Discovery Now
          </button>
          {!canRun && (
            <span className="text-xs text-gray-400">Pick subtypes &amp; localities below first</span>
          )}
        </div>
      </div>

      <SearchPlan
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
        selectedLocalities={selectedLocalities}
        setSelectedLocalities={setSelectedLocalities}
      />

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

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="all">All industries</option>
          {DISCOVERY_INDUSTRIES.map((ind) => (
            <option key={ind.industry} value={ind.industry}>{ind.industry}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="card p-10 text-center text-gray-400 text-sm">
          {tab === "pending"
            ? "Nothing to review. Run discovery to search for new listings."
            : `No ${tab} candidates yet.`}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              c={c}
              busy={busyId === c.id}
              onApprove={approve}
              onReject={reject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
