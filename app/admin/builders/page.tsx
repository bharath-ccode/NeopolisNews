"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2, Globe, Phone, Mail, Loader2, HardHat } from "lucide-react";
import { getBuilders, deleteBuilder, type Builder } from "@/lib/buildersStore";

export default function BuildersPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setBuilders(await getBuilders());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also remove associated projects.`)) return;
    setDeleting(id);
    try {
      await deleteBuilder(id);
      setBuilders((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Builders</h2>
          <p className="text-sm text-gray-400">{builders.length} registered builder{builders.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/builders/create" className="btn-primary text-sm py-2">
          <PlusCircle className="w-3.5 h-3.5" />
          Add Builder
        </Link>
      </div>

      {builders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <HardHat className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No builders yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first builder to get started.</p>
          <Link href="/admin/builders/create" className="btn-primary text-sm py-2 mt-4 inline-flex">
            <PlusCircle className="w-3.5 h-3.5" /> Add Builder
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {builders.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
              {/* Logo + name */}
              <div className="flex items-center gap-3">
                {b.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.logoUrl}
                    alt={b.builderName}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <HardHat className="w-6 h-6 text-brand-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{b.builderName}</p>
                  {b.address && (
                    <p className="text-xs text-gray-400 truncate">{b.address}</p>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1 text-xs text-gray-500">
                {b.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                )}
                {b.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{b.email}</span>
                  </div>
                )}
                {b.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline truncate"
                    >
                      {b.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
                <Link
                  href={`/admin/builders/${b.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(b.id, b.builderName)}
                  disabled={deleting === b.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting === b.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
