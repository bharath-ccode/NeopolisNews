"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IndianRupee, Search, SlidersHorizontal, Loader2,
  CheckCircle, Clock, XCircle, TrendingUp, X,
} from "lucide-react";

interface WellnessSessionSnippet {
  id: string;
  session_type: string;
  trainer_name: string;
  platform_label: string;
  language: string;
  start_date: string;
  end_date: string;
  business_id: string;
}

interface PaymentRow {
  id: string;
  user_email: string | null;
  payment_status: "paid" | "pending" | "failed";
  amount_inr: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  enrolled_at: string;
  paid_at: string | null;
  wellness_sessions: WellnessSessionSnippet | null;
}

interface Stats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  revenue: number;
}

const SESSION_TYPES = [
  "Yoga", "Pilates", "Meditation", "Breathwork & Pranayama",
  "CrossFit", "Functional Training", "Zumba & Dance", "Martial Arts",
  "Stretching & Flexibility", "Cycling", "Sound Healing", "General Fitness",
];

const STATUS_STYLE: Record<string, string> = {
  paid:    "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed:  "bg-red-50 text-red-600 border-red-200",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  paid:    CheckCircle,
  pending: Clock,
  failed:  XCircle,
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPaymentsPage() {
  const [rows, setRows]         = useState<PaymentRow[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);

  // Filters
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [type, setType]         = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)   params.set("search",  search);
    if (status)   params.set("status",  status);
    if (dateFrom) params.set("from",    dateFrom);
    if (dateTo)   params.set("to",      dateTo);
    if (type)     params.set("type",    type);

    const res  = await fetch(`/api/admin/payments?${params}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setStats(data.stats ?? null);
    setLoading(false);
  }, [search, status, dateFrom, dateTo, type]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  function clearFilters() {
    setSearch(""); setStatus(""); setDateFrom(""); setDateTo(""); setType("");
  }

  const hasFilters = search || status || dateFrom || dateTo || type;

  return (
    <div className="space-y-6">

      {/* ── Stats strip ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">
                ₹{stats.revenue.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-400">Total Revenue</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-400">Total Enrollments</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{stats.paid}</p>
              <p className="text-xs text-gray-400">Paid</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search email, trainer, session type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Session type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="">All Session Types</option>
            {SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors border border-gray-200"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            No payments found{hasFilters ? " for the current filters." : "."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Session Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Trainer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Platform</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r) => {
                  const ws = r.wellness_sessions;
                  const Icon = STATUS_ICON[r.payment_status] ?? Clock;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs font-semibold text-gray-800">{fmt(r.enrolled_at)}</p>
                        <p className="text-[11px] text-gray-400">{fmtTime(r.enrolled_at)}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-xs text-gray-700 truncate">{r.user_email ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          {ws?.session_type ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-700 truncate max-w-[120px]">{ws?.trainer_name ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">{ws?.platform_label ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{r.amount_inr.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[r.payment_status]}`}>
                          <Icon className="w-3 h-3" />
                          {r.payment_status.charAt(0).toUpperCase() + r.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[11px] font-mono text-gray-400 truncate max-w-[120px]" title={r.razorpay_payment_id ?? ""}>
                          {r.razorpay_payment_id ? r.razorpay_payment_id.slice(-12) : "—"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              {rows.length} record{rows.length !== 1 ? "s" : ""}
              {stats && stats.paid > 0 && (
                <span className="ml-3 font-semibold text-green-700">
                  ₹{stats.revenue.toLocaleString("en-IN")} collected
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
