"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Phone, Clock, CheckCheck, Loader2 } from "lucide-react";

interface Enquiry {
  id: string;
  sender_name: string;
  sender_phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
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

export default function EnquiriesTab({
  businessId,
  token,
}: {
  businessId: string;
  token: string;
}) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/my-business/enquiries?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEnquiries(data); })
      .finally(() => setLoading(false));
  }, [businessId, token]);

  async function markRead(id: string) {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, is_read: true } : e)));
    await fetch("/api/my-business/enquiries", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, enquiryId: id }),
    });
  }

  const unread = enquiries.filter((e) => !e.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-900">Customer Messages</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {enquiries.length} total · {unread} unread
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Messages from customers via your business profile will appear here.
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
                    <p className="text-xs text-gray-500">{e.sender_phone}</p>
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-1">{e.message}</p>
                  </div>
                </div>
              </button>

              {active === e.id && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 ml-12">
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
  );
}
