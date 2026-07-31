"use client";

import { useState } from "react";
import { MessageSquare, X, Loader2, CheckCircle2 } from "lucide-react";

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";

export default function ContactButton({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch(`/api/businesses/${businessId}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderName: name, senderPhone: phone, message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to send. Please try again.");
    } else {
      setSent(true);
    }
    setSending(false);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => { setSent(false); setError(""); setName(""); setPhone(""); setMessage(""); }, 300);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
      >
        <MessageSquare className="w-4 h-4" /> Send Message
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={handleClose}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Send a Message</p>
                <p className="text-xs text-gray-400 mt-0.5">{businessName}</p>
              </div>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {sent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-gray-900 mb-1">Message Sent!</p>
                  <p className="text-sm text-gray-500">
                    {businessName} will get back to you shortly.
                  </p>
                  <button onClick={handleClose} className="btn-primary text-sm mt-5">Done</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Name *</label>
                    <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Phone *</label>
                    <div className="flex">
                      <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">+91</span>
                      <input
                        type="tel"
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9900000000"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message *</label>
                    <textarea
                      className={INPUT + " resize-none"}
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi, I'd like to know more about…"
                      required
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</p>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={handleClose} className="flex-1 btn-secondary text-sm">Cancel</button>
                    <button type="submit" disabled={sending} className="flex-1 btn-primary text-sm">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
