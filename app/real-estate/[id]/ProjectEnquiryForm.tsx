"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, Phone, Mail, User, MessageSquare, ChevronDown } from "lucide-react";

// Common country codes — expandable list
const COUNTRY_CODES = [
  { code: "+91",  flag: "🇮🇳", name: "India"          },
  { code: "+1",   flag: "🇺🇸", name: "USA / Canada"   },
  { code: "+44",  flag: "🇬🇧", name: "UK"             },
  { code: "+971", flag: "🇦🇪", name: "UAE"            },
  { code: "+65",  flag: "🇸🇬", name: "Singapore"      },
  { code: "+61",  flag: "🇦🇺", name: "Australia"      },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia"       },
  { code: "+49",  flag: "🇩🇪", name: "Germany"        },
  { code: "+33",  flag: "🇫🇷", name: "France"         },
  { code: "+81",  flag: "🇯🇵", name: "Japan"          },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface FormState {
  senderName:  string;
  countryCode: string;
  phoneDigits: string;
  senderEmail: string;
  message:     string;
}

interface FieldErrors {
  senderName?:  string;
  senderPhone?: string;
  senderEmail?: string;
  message?:     string;
}

const INPUT =
  "w-full bg-brand-900 border border-brand-700 text-white placeholder-brand-400 " +
  "rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 " +
  "focus:border-brand-400 transition-colors";

const INPUT_ERROR =
  "w-full bg-brand-900 border border-red-500 text-white placeholder-brand-400 " +
  "rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors";

export default function ProjectEnquiryForm({
  projectId,
  projectName,
}: {
  projectId:   string;
  projectName: string;
}) {
  const [form, setForm] = useState<FormState>({
    senderName:  "",
    countryCode: "+91",
    phoneDigits: "",
    senderEmail: "",
    message:     "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading]   = useState(false);
  const [done,    setDone]      = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [ccOpen,  setCcOpen]    = useState(false);

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => ({ ...prev, [key === "countryCode" || key === "phoneDigits" ? "senderPhone" : key]: undefined }));
  }

  function validate(): boolean {
    const errs: FieldErrors = {};

    if (!form.senderName.trim())
      errs.senderName = "Your name is required.";

    const digits = form.phoneDigits.replace(/\s/g, "");
    if (!digits)
      errs.senderPhone = "Phone number is required.";
    else if (!/^\d{6,12}$/.test(digits))
      errs.senderPhone = "Enter 6–12 digits after the country code.";

    if (!form.senderEmail.trim())
      errs.senderEmail = "Email address is required.";
    else if (!EMAIL_RE.test(form.senderEmail.trim()))
      errs.senderEmail = "Enter a valid email address.";

    if (!form.message.trim())
      errs.message = "Please add a message.";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    const senderPhone = `${form.countryCode}${form.phoneDigits.replace(/\s/g, "")}`;

    try {
      const res = await fetch(`/api/projects/${projectId}/enquire`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          senderName:  form.senderName.trim(),
          senderPhone,
          senderEmail: form.senderEmail.trim(),
          message:     form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error ?? "Something went wrong."); return; }
      setDone(true);
    } catch {
      setApiError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <CheckCircle className="w-12 h-12 text-green-400" />
        <p className="font-bold text-white text-lg">Enquiry sent!</p>
        <p className="text-brand-300 text-sm max-w-xs">
          The {projectName} team will contact you shortly. Check your email for confirmation.
        </p>
      </div>
    );
  }

  const selectedCC = COUNTRY_CODES.find(c => c.code === form.countryCode) ?? COUNTRY_CODES[0];

  return (
    <div>
      <p className="text-white font-bold text-base mb-1">Send an Enquiry</p>
      <p className="text-brand-300 text-sm mb-5">
        Interested in a unit? We&apos;ll get back to you within 24 hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Name */}
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 pointer-events-none" />
            <input
              className={`${fieldErrors.senderName ? INPUT_ERROR : INPUT} pl-9`}
              placeholder="Full name *"
              value={form.senderName}
              onChange={e => set("senderName", e.target.value)}
              maxLength={80}
            />
          </div>
          {fieldErrors.senderName && <p className="text-red-400 text-xs mt-1">{fieldErrors.senderName}</p>}
        </div>

        {/* Phone with country code */}
        <div>
          <div className={`flex rounded-lg overflow-hidden border ${fieldErrors.senderPhone ? "border-red-500" : "border-brand-700"} focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400 transition-colors`}>
            {/* Country code picker */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setCcOpen(v => !v)}
                className="flex items-center gap-1.5 h-full px-3 bg-brand-800 text-white text-sm font-semibold whitespace-nowrap border-r border-brand-700 hover:bg-brand-700 transition-colors"
              >
                <span>{selectedCC.flag}</span>
                <span>{selectedCC.code}</span>
                <ChevronDown className="w-3 h-3 text-brand-400" />
              </button>

              {ccOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-52 bg-brand-900 border border-brand-700 rounded-xl shadow-xl overflow-hidden">
                  {COUNTRY_CODES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { set("countryCode", c.code); setCcOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-800 transition-colors text-left ${c.code === form.countryCode ? "text-brand-300 font-semibold" : "text-white"}`}
                    >
                      <span>{c.flag}</span>
                      <span className="flex-1">{c.name}</span>
                      <span className="text-brand-400 text-xs">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Digits */}
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 pointer-events-none" />
              <input
                type="tel"
                className="w-full bg-brand-900 text-white placeholder-brand-400 px-3 py-2.5 pl-9 text-sm focus:outline-none"
                placeholder="9900000000 *"
                value={form.phoneDigits}
                onChange={e => set("phoneDigits", e.target.value.replace(/[^\d\s]/g, ""))}
                maxLength={15}
              />
            </div>
          </div>
          {fieldErrors.senderPhone && <p className="text-red-400 text-xs mt-1">{fieldErrors.senderPhone}</p>}
          <p className="text-brand-500 text-xs mt-1">Country code + number e.g. {selectedCC.code} 9900000000</p>
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 pointer-events-none" />
            <input
              type="email"
              className={`${fieldErrors.senderEmail ? INPUT_ERROR : INPUT} pl-9`}
              placeholder="Email address *"
              value={form.senderEmail}
              onChange={e => set("senderEmail", e.target.value)}
              maxLength={120}
            />
          </div>
          {fieldErrors.senderEmail && <p className="text-red-400 text-xs mt-1">{fieldErrors.senderEmail}</p>}
        </div>

        {/* Message */}
        <div>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-brand-400 pointer-events-none" />
            <textarea
              className={`${fieldErrors.message ? INPUT_ERROR : INPUT} pl-9 resize-none`}
              placeholder="Message — BHK preference, budget, timeline… *"
              rows={3}
              value={form.message}
              onChange={e => set("message", e.target.value)}
              maxLength={1000}
            />
          </div>
          {fieldErrors.message && <p className="text-red-400 text-xs mt-1">{fieldErrors.message}</p>}
        </div>

        {apiError && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-3 py-2.5">{apiError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Sending…" : "Send Enquiry"}
        </button>

        <p className="text-brand-500 text-xs text-center">
          Your details are shared only with the {projectName} sales team.
        </p>
      </form>
    </div>
  );
}
