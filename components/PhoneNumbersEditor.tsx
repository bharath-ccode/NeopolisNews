"use client";

import { Plus, Trash2, Phone } from "lucide-react";

export interface PhoneEntry {
  number: string;
  purpose: string;
}

// Purpose suggestions keyed by industry keyword
const PURPOSE_SUGGESTIONS: Record<string, string[]> = {
  hospital:    ["Appointments", "Emergency", "Ambulance", "ICU", "Reception", "OPD"],
  clinic:      ["Appointments", "Emergency", "Reception", "Doctor Direct"],
  health:      ["Appointments", "Emergency", "Ambulance", "Reception"],
  medical:     ["Appointments", "Emergency", "Reception"],
  pharmacy:    ["Orders", "Home Delivery", "Main"],
  education:   ["Admissions", "Principal", "Office", "Transport", "Fees"],
  school:      ["Admissions", "Principal", "Office", "Transport"],
  college:     ["Admissions", "Office", "Dean", "Hostel"],
  coaching:    ["Admissions", "Office", "Main"],
  restaurant:  ["Reservations", "Home Delivery", "Takeaway", "Main"],
  hotel:       ["Reservations", "Front Desk", "Room Service", "Events"],
  gym:         ["Membership", "Main", "Trainer"],
  spa:         ["Appointments", "Main"],
  salon:       ["Appointments", "Main"],
};

function getSuggestions(industry: string): string[] {
  const key = industry.toLowerCase();
  for (const [k, v] of Object.entries(PURPOSE_SUGGESTIONS)) {
    if (key.includes(k)) return v;
  }
  return ["Main", "WhatsApp", "Customer Care", "Sales", "Support", "Office"];
}

const INPUT =
  "px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

interface Props {
  phones: PhoneEntry[];
  onChange: (phones: PhoneEntry[]) => void;
  industry?: string;
}

export default function PhoneNumbersEditor({ phones, onChange, industry = "" }: Props) {
  const suggestions = getSuggestions(industry);

  function add() {
    onChange([...phones, { number: "", purpose: suggestions[0] ?? "Main" }]);
  }

  function update(i: number, field: keyof PhoneEntry, val: string) {
    const next = phones.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange(next);
  }

  function remove(i: number) {
    onChange(phones.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {phones.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          {/* Purpose — datalist for suggestions + free type */}
          <div className="w-40 shrink-0">
            <input
              list={`purposes-${i}`}
              value={p.purpose}
              onChange={(e) => update(i, "purpose", e.target.value)}
              placeholder="Purpose"
              className={INPUT + " w-full"}
            />
            <datalist id={`purposes-${i}`}>
              {suggestions.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          {/* Number */}
          <div className="flex flex-1 min-w-0">
            <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500 shrink-0">
              +91
            </span>
            <input
              type="tel"
              value={p.number.replace(/^\+91/, "")}
              onChange={(e) => update(i, "number", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9900000000"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="button"
            onClick={() => remove(i)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium mt-1"
      >
        <Plus className="w-4 h-4" /> Add phone number
      </button>

      {phones.length === 0 && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Phone className="w-3.5 h-3.5" /> No phone numbers yet — click Add to start.
        </p>
      )}
    </div>
  );
}
