"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  Copy,
  CheckCircle,
  Clock,
  ExternalLink,
  Search,
  Users,
  Pencil,
  AlertCircle,
  FileText,
} from "lucide-react";
import { getAllBusinesses, type BusinessRecord } from "@/lib/businessStore";
import { createClient } from "@/lib/supabase/client";

interface PendingBiz {
  id: string;
  name: string;
  address: string;
  created_at: string;
  verification_requests: { submitter_name: string; submitter_email: string; created_at: string }[];
}

interface SelfRegBiz {
  id: string;
  name: string;
  industry: string;
  address: string;
  status: string;
  owner_email: string;
  created_at: string;
}

function getInviteLink(id: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/onboard/${id}`;
}

function StatusBadge({ status }: { status: BusinessRecord["status"] }) {
  if (status === "active")   return <span className="tag-green">Active</span>;
  if (status === "incomplete") return <span className="tag-orange">Incomplete</span>;
  if (status === "pending")  return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Pending</span>;
  if (status === "verified") return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Verified</span>;
  return <span className="tag-blue">Invited</span>;
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [pendingBiz, setPendingBiz] = useState<PendingBiz[]>([]);
  const [selfRegBiz, setSelfRegBiz] = useState<SelfRegBiz[]>([]);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const local = getAllBusinesses();
    setBusinesses(local);
    const localIds = new Set(local.map((b) => b.id));

    const supabase = createClient();

    // Fetch pending verification requests from Supabase
    supabase
      .from("businesses")
      .select("id, name, address, created_at, verification_requests(submitter_name, submitter_email, created_at)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPendingBiz(data as PendingBiz[]); });

    // Fetch all Supabase businesses not already tracked in localStorage
    supabase
      .from("businesses")
      .select("id, name, industry, address, status, owner_email, created_at")
      .in("status", ["active", "invited", "incomplete"])
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setSelfRegBiz((data as SelfRegBiz[]).filter((b) => !localIds.has(b.id)));
        }
      });
  }, []);

  function copyLink(id: string) {
    navigator.clipboard.writeText(getInviteLink(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const q = search.toLowerCase();
  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.industry.toLowerCase().includes(q) ||
      b.types.some((t) => t.toLowerCase().includes(q)) ||
      b.subtypes.some((s) => s.toLowerCase().includes(q)) ||
      (b.ownerPhone ?? "").includes(q)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">
              Neopolis<span className="text-brand-600">News</span>
            </span>
            <span className="ml-2 text-xs text-gray-400">/ Admin / Businesses</span>
          </div>
        </div>
        <Link href="/admin/businesses/new" className="btn-primary text-sm">
          <PlusCircle className="w-4 h-4" /> Add Business
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total",   value: businesses.length, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Active",  value: businesses.filter((b) => b.status === "active").length, icon: CheckCircle, color: "bg-green-50 text-green-600" },
            { label: "Invited", value: businesses.filter((b) => b.status === "invited").length, icon: Clock, color: "bg-orange-50 text-orange-600" },
            { label: "Pending", value: pendingBiz.length, icon: AlertCircle, color: pendingBiz.length > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400" },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending verification requests */}
        {pendingBiz.length > 0 && (
          <div className="card overflow-hidden mb-6 border-amber-200">
            <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-sm font-bold text-amber-900">
                {pendingBiz.length} Pending Verification {pendingBiz.length === 1 ? "Request" : "Requests"}
              </p>
              <p className="text-xs text-amber-700 ml-1">— review and approve to send the owner a claim link</p>
            </div>
            <div className="divide-y divide-amber-50">
              {pendingBiz.map((b) => {
                const vr = b.verification_requests?.[0];
                return (
                  <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm text-gray-900">{b.name}</p>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Pending</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1 truncate">{b.address}</p>
                        {vr && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FileText className="w-3 h-3" />
                            <span>
                              Request from <strong className="text-gray-600">{vr.submitter_name}</strong>
                              {" "}({vr.submitter_email}) ·{" "}
                              {new Date(vr.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/businesses/${b.id}`}
                      className="shrink-0 flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Review
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Self-registered businesses */}
        {selfRegBiz.length > 0 && (
          <div className="card overflow-hidden mb-6 border-blue-200">
            <div className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-b border-blue-100">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-sm font-bold text-blue-900">
                {selfRegBiz.length} {selfRegBiz.length === 1 ? "Business" : "Businesses"} in Database
              </p>
              <p className="text-xs text-blue-700 ml-1">— stored in Supabase (admin-created or self-registered)</p>
            </div>
            <div className="divide-y divide-blue-50">
              {selfRegBiz.map((b) => (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm text-gray-900">{b.name}</p>
                        {b.status === "active"
                          ? <span className="tag-green">Active</span>
                          : <span className="tag-blue">Invited</span>}
                      </div>
                      <p className="text-xs text-gray-500 mb-0.5 truncate">{b.industry}</p>
                      <p className="text-xs text-gray-400 truncate">{b.address}</p>
                      <p className="text-xs text-gray-400">{b.owner_email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <a
                      href={`/businesses/${b.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + list */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, industry, type, or phone…"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-gray-300" />
              </div>
              {businesses.length === 0 ? (
                <>
                  <p className="font-semibold text-gray-600 mb-1">No businesses yet</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Add your first business to get started.
                  </p>
                  <Link href="/admin/businesses/new" className="btn-primary text-sm">
                    <PlusCircle className="w-4 h-4" /> Add Business
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-600">No results</p>
                  <p className="text-sm text-gray-400">Try a different search term.</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: business info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm text-gray-900">{b.name}</p>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{b.industry}</p>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {b.types.map((t) => (
                            <span key={t} className="tag-blue text-xs">{t}</span>
                          ))}
                        </div>
                        {b.subtypes.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {b.subtypes.map((s) => (
                              <span key={s} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                          <span title="Owner / Manager No.">{b.ownerPhone}</span>
                          {b.contactPhone && (
                            <span title="Customer Contact">{b.contactPhone}</span>
                          )}
                          {b.email && <span>{b.email}</span>}
                          <span className="truncate max-w-xs">{b.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/businesses/${b.id}`}
                          className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                        {b.status !== "active" && (
                          <>
                            <button
                              onClick={() => copyLink(b.id)}
                              className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              {copiedId === b.id ? (
                                <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /> Copy Invite Link</>
                              )}
                            </button>
                            <a
                              href={getInviteLink(b.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600 px-2 py-1.5 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
