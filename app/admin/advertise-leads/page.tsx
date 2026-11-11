"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, Megaphone, Phone, Mail, AlertCircle } from "lucide-react";

type Purpose = "advertise-sales" | "advertise-real-estate" | "advertise-health" | "advertise-education" | "advertise-services";

const TABS: { key: Purpose | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "advertise-sales", label: "Sales" },
  { key: "advertise-real-estate", label: "Real Estate" },
  { key: "advertise-health", label: "Health" },
  { key: "advertise-education", label: "Education" },
  { key: "advertise-services", label: "Services" },
];

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  purpose: string;
  created_at: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminAdvertiseLeadsPage() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Purpose | "all">("all");
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/advertise-leads");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError((data as { error?: string })?.error ?? `Failed to load (${res.status}).`);
        setRows([]);
        return;
      }
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error — couldn't reach the server.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const counts = TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t.key] = t.key === "all" ? rows.length : rows.filter((r) => r.purpose === t.key).length;
    return acc;
  }, {});

  const filtered = rows
    .filter((r) => tab === "all" || r.purpose === tab)
    .filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.phone.includes(q) || (r.email ?? "").toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-brand-500" /> Advertise Enquiries
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          All contact-form submissions from the /advertise pages
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 gap-1 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === key ? "border-brand-500 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === key ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"}`}>
              {counts[key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          {/401|admin sign-in|expired/i.test(error) && " — try logging out and back in to /admin."}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : error ? null : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium text-gray-500">No enquiries here yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Contact</th>
                {tab === "all" && <th className="px-4 py-3 font-semibold">Category</th>}
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {r.phone}
                    </p>
                    {r.email && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {r.email}
                      </p>
                    )}
                  </td>
                  {tab === "all" && (
                    <td className="px-4 py-3 text-gray-700">
                      {TABS.find((t) => t.key === r.purpose)?.label ?? r.purpose}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={r.message ?? ""}>
                    {r.message || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
