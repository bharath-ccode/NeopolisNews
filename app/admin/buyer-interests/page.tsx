"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, Users, Phone, Mail } from "lucide-react";

const TIER_LABELS: Record<string, string> = {
  affordable: "Affordable",
  premium: "Premium",
  luxury: "Luxury",
  uber_luxury: "Uber Luxury",
};

interface BuyerInterest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  property_type: string;
  bedrooms: number;
  areas: string[];
  tiers: string[];
  created_at: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminBuyerInterestsPage() {
  const [rows, setRows] = useState<BuyerInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/buyer-interests");
    const data = await res.json().catch(() => []);
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.areas.some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" /> Buyer Interest
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {rows.length} prospective buyer{rows.length === 1 ? "" : "s"} from the /real-estate Express Interest form
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or area…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium text-gray-500">No buyer interest submissions yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Buyer</th>
                <th className="px-4 py-3 font-semibold">Looking for</th>
                <th className="px-4 py-3 font-semibold">Areas</th>
                <th className="px-4 py-3 font-semibold">Budget tier</th>
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
                  <td className="px-4 py-3 text-gray-700">
                    {r.property_type === "apartment" ? "Apartment" : "Villa"} · {r.bedrooms} BHK
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.areas.join(", ")}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {r.tiers.length ? r.tiers.map((t) => TIER_LABELS[t] ?? t).join(", ") : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
