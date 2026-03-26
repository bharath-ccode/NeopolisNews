"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

interface LeadFormProps {
  title?: string;
  subtitle?: string;
  purpose?: string;
  dark?: boolean;
}

export default function LeadForm({
  title = "Get in Touch",
  subtitle = "Leave your details and our team will reach out within 24 hours.",
  purpose = "general",
  dark = false,
}: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production: POST to /api/leads
    setSubmitted(true);
  }

  const inputClass = dark
    ? "w-full bg-brand-900 border border-brand-700 text-white placeholder-brand-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
    : "w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className={`font-semibold text-lg ${dark ? "text-white" : "text-gray-900"}`}>
          Thanks! We&apos;ll be in touch soon.
        </p>
        <p className={`text-sm ${dark ? "text-brand-300" : "text-gray-500"}`}>
          Our team typically responds within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 className={`text-xl font-bold mb-1 ${dark ? "text-white" : "text-gray-900"}`}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p className={`text-sm mb-5 ${dark ? "text-brand-300" : "text-gray-500"}`}>
          {subtitle}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="hidden"
          name="purpose"
          value={purpose}
        />
        <input
          className={inputClass}
          placeholder="Your name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className={inputClass}
          placeholder="Mobile number *"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          className={inputClass}
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <textarea
          className={inputClass}
          placeholder="Message (optional)"
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <button type="submit" className="btn-primary w-full justify-center">
          <Send className="w-4 h-4" />
          Send Enquiry
        </button>
        <p className={`text-xs text-center ${dark ? "text-brand-400" : "text-gray-400"}`}>
          By submitting, you agree to our privacy policy. No spam, ever.
        </p>
      </form>
    </div>
  );
}
