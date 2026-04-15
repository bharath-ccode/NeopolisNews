// ─── Business record store (localStorage) ───────────────────────────────────

export type BusinessStatus = "invited" | "active" | "incomplete";

export interface DayTiming {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessRecord {
  id: string;            // also used as the invite token
  // Admin-created
  name: string;
  industry: string;
  types: string[];       // one or more types within the industry
  subtypes: string[];    // flat list of selected subtypes across all types
  address: string;
  phone: string;         // primary identifier, used for OTP claim
  email?: string;        // optional, can be added by owner later
  status: BusinessStatus;
  createdAt: string;
  // Owner-completed
  description?: string;
  timings?: DayTiming[];
  completedAt?: string;
}

const STORE_KEY = "neopolis_businesses";

function readAll(): BusinessRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as BusinessRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: BusinessRecord[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(records));
}

export function getAllBusinesses(): BusinessRecord[] {
  return readAll();
}

export function getBusinessById(id: string): BusinessRecord | null {
  return readAll().find((b) => b.id === id) ?? null;
}

export function saveBusiness(business: BusinessRecord): void {
  const all = readAll();
  const idx = all.findIndex((b) => b.id === business.id);
  if (idx >= 0) all[idx] = business;
  else all.push(business);
  writeAll(all);
}

export function createBusiness(
  data: Omit<BusinessRecord, "id" | "status" | "createdAt">
): BusinessRecord {
  const record: BusinessRecord = {
    ...data,
    id: Math.random().toString(36).slice(2, 10).toUpperCase(),
    status: "invited",
    createdAt: new Date().toISOString(),
  };
  saveBusiness(record);
  return record;
}

/** Default operating hours: Mon–Sat 09:00–21:00, Sun closed */
export const DEFAULT_TIMINGS: DayTiming[] = [
  { day: "Monday",    open: "09:00", close: "21:00", closed: false },
  { day: "Tuesday",   open: "09:00", close: "21:00", closed: false },
  { day: "Wednesday", open: "09:00", close: "21:00", closed: false },
  { day: "Thursday",  open: "09:00", close: "21:00", closed: false },
  { day: "Friday",    open: "09:00", close: "22:00", closed: false },
  { day: "Saturday",  open: "10:00", close: "22:00", closed: false },
  { day: "Sunday",    open: "10:00", close: "20:00", closed: true  },
];
