"use client";

import { useState } from "react";
import { MessageSquare, Phone, Clock, CheckCheck, Home } from "lucide-react";

const MOCK_ENQUIRIES = [
  {
    id: "e1",
    from: "Rahul Sharma",
    phone: "+91 98765 43210",
    listing: "3 BHK in Apex Tower, Tower B — Floor 24",
    listingType: "Rent",
    time: "2 hours ago",
    message: "Is the flat still available? I'm looking to move in by April 15. Can we schedule a site visit this weekend?",
    read: false,
  },
  {
    id: "e2",
    from: "Priya Mehta",
    phone: "+91 87654 32109",
    listing: "2 BHK in Neopolis Heights, Tower A — Floor 12",
    listingType: "Sale",
    time: "Yesterday, 4:32 PM",
    message: "What is the negotiated price? I'm a serious buyer and have pre-approved home loan from SBI. Can we meet?",
    read: false,
  },
  {
    id: "e3",
    from: "Amit Kumar",
    phone: "+91 76543 21098",
    listing: "3 BHK in Apex Tower, Tower B — Floor 24",
    listingType: "Rent",
    time: "2 days ago",
    message: "Looking for 11-month rent agreement. Any flexibility on security deposit? Preferred move-in April 1.",
    read: true,
  },
  {
    id: "e4",
    from: "Neha Gupta",
    phone: "+91 65432 10987",
    listing: "2 BHK in Neopolis Heights, Tower A — Floor 12",
    listingType: "Sale",
    time: "3 days ago",
    message: "I saw your listing online. Is this a direct-owner deal or through broker? Happy to discuss further.",
    read: true,
  },
];

export default function IndividualEnquiries() {
  const [enquiries, setEnquiries] = useState(MOCK_ENQUIRIES);
  const [active, setActive] = useState<string | null>(null);

  function markRead(id: string) {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, read: true } : e))
    );
  }

  const unread = enquiries.filter((e) => !e.read).length;

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Enquiries</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {enquiries.length} total · {unread} unread
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No enquiries yet</p>
          <p className="text-xs text-gray-400 mt-1">Enquiries from buyers and tenants will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div
              key={e.id}
              className={`card overflow-hidden ${!e.read ? "border-l-4 border-l-brand-500" : ""}`}
            >
              <button
                className="w-full text-left p-4"
                onClick={() => {
                  setActive(active === e.id ? null : e.id);
                  markRead(e.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {e.from.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{e.from}</span>
                        {!e.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                        <Clock className="w-3 h-3" /> {e.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Home className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">{e.listing}</span>
                      <span className={e.listingType === "Rent" ? "tag-green text-xs" : "tag-blue text-xs"}>
                        {e.listingType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-1">
                      {e.message}
                    </p>
                  </div>
                </div>
              </button>

              {/* Expanded */}
              {active === e.id && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 ml-12">
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{e.message}</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${e.phone}`}
                      className="flex items-center gap-2 btn-primary text-xs py-2"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call {e.from.split(" ")[0]}
                    </a>
                    <a
                      href={`https://wa.me/${e.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 btn-secondary text-xs py-2"
                    >
                      WhatsApp
                    </a>
                    {!e.read && (
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
