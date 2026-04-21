"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Phone, Clock, CheckCheck, Building2, Loader2, ArrowLeft } from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { createClient } from "@/lib/supabase/client";

interface Enquiry {
  id: string;
  project_id: string;
  sender_name: string;
  sender_phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
  projectName: string;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function BuilderEnquiriesPage() {
  const { builder } = useBuilderAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!builder) return;
    const sb = createClient();

    sb.from("projects")
      .select("id, project_name")
      .eq("builder_id", builder.id)
      .then(async ({ data: projects }) => {
        const ids = (projects ?? []).map((p: { id: string }) => p.id);
        const nameMap = Object.fromEntries(
          (projects ?? []).map((p: { id: string; project_name: string }) => [p.id, p.project_name])
        );
        if (ids.length === 0) { setLoading(false); return; }

        const { data } = await sb
          .from("project_enquiries")
          .select("id, project_id, sender_name, sender_phone, message, is_read, created_at")
          .in("project_id", ids)
          .order("created_at", { ascending: false });

        setEnquiries(
          (data ?? []).map((e: Omit<Enquiry, "projectName">) => ({
            ...e,
            projectName: nameMap[e.project_id] ?? "Project",
          }))
        );
        setLoading(false);
      });
  }, [builder]);

  async function markRead(id: string) {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, is_read: true } : e)));
    await createClient().from("project_enquiries").update({ is_read: true }).eq("id", id);
  }

  const unread = enquiries.filter((e) => !e.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Link href="/builder" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-gray-900">Builder Portal</span>
          <span className="ml-2 text-xs text-gray-400">/ Project Enquiries</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Project Enquiries</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {enquiries.length} total · {unread} unread
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No enquiries yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Buyer enquiries from your project pages will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {enquiries.map((e) => (
              <div
                key={e.id}
                className={`card overflow-hidden ${!e.is_read ? "border-l-4 border-l-brand-500" : ""}`}
              >
                <button
                  className="w-full text-left p-4"
                  onClick={() => {
                    setActive(active === e.id ? null : e.id);
                    if (!e.is_read) markRead(e.id);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {e.sender_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{e.sender_name}</span>
                          {!e.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                        </div>
                        <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                          <Clock className="w-3 h-3" /> {relativeTime(e.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 truncate">{e.projectName}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1.5 line-clamp-1">{e.message}</p>
                    </div>
                  </div>
                </button>

                {active === e.id && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3 ml-12">
                    <p className="text-xs text-gray-400 mb-1">{e.projectName}</p>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{e.message}</p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`tel:${e.sender_phone}`}
                        className="flex items-center gap-2 btn-primary text-xs py-2"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call {e.sender_name.split(" ")[0]}
                      </a>
                      <a
                        href={`https://wa.me/${e.sender_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 btn-secondary text-xs py-2"
                      >
                        WhatsApp
                      </a>
                      {!e.is_read && (
                        <button
                          onClick={() => markRead(e.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
