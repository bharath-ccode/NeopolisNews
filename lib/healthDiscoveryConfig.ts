import { LOCALITIES, type Locality } from "@/lib/projectsStore";

// What to search for, and how to file it once found. businessType/subtype
// must match lib/businessDirectory.ts's "Health & Wellness" taxonomy so a
// promoted candidate lands in the right directory category.
export interface DiscoveryTarget {
  businessType: string;
  subtype: string;
  queryTerm: string; // human search phrase, e.g. "dental clinic"
}

export const HEALTH_DISCOVERY_TARGETS: DiscoveryTarget[] = [
  { businessType: "Clinics", subtype: "Dental & Orthodontics",      queryTerm: "dental clinic" },
  { businessType: "Clinics", subtype: "Dermatology & Cosmetology",  queryTerm: "dermatology clinic" },
  { businessType: "Clinics", subtype: "Orthopaedics & Bone Care",   queryTerm: "orthopedic clinic" },
  { businessType: "Clinics", subtype: "General Practice & Family Medicine", queryTerm: "general physician clinic" },
  { businessType: "Clinics", subtype: "Gynaecology & Obstetrics",   queryTerm: "gynaecology clinic" },
  { businessType: "Clinics", subtype: "Paediatrics & Child Care",   queryTerm: "paediatric clinic" },
  { businessType: "Clinics", subtype: "ENT (Ear, Nose & Throat)",   queryTerm: "ENT clinic" },
  { businessType: "Diagnostics", subtype: "Blood Tests & Pathology", queryTerm: "diagnostic lab" },
  { businessType: "Pharmacies", subtype: "24hr Pharmacy",           queryTerm: "pharmacy" },
];

// Which of the app's localities to search. Defaults to all of them; trim
// this down if a monthly run should stay cheaper/narrower.
export const DISCOVERY_LOCALITIES: Locality[] = [...LOCALITIES];

export function buildQuery(target: DiscoveryTarget, locality: Locality): string {
  return `${target.queryTerm} in ${locality}, Hyderabad, Telangana`;
}
