import type { DiscoveryIndustryConfig } from "./types";

// lib/businessDirectory.ts TAXONOMY["Health & Wellness"] — only the
// subtypes worth Places-searching get a queryTerm here; the rest of that
// taxonomy (e.g. "Old Age Care") isn't a good Places search target.
export const HEALTH_DISCOVERY: DiscoveryIndustryConfig = {
  industry: "Health & Wellness",
  types: [
    {
      type: "Clinics",
      subtypes: [
        { subtype: "Dental & Orthodontics",              queryTerm: "dental clinic" },
        { subtype: "Dermatology & Cosmetology",           queryTerm: "dermatology clinic" },
        { subtype: "Orthopaedics & Bone Care",            queryTerm: "orthopedic clinic" },
        { subtype: "General Practice & Family Medicine",  queryTerm: "general physician clinic" },
        { subtype: "Gynaecology & Obstetrics",            queryTerm: "gynaecology clinic" },
        { subtype: "Paediatrics & Child Care",            queryTerm: "paediatric clinic" },
        { subtype: "ENT (Ear, Nose & Throat)",            queryTerm: "ENT clinic" },
      ],
    },
    {
      type: "Diagnostics",
      subtypes: [
        { subtype: "Blood Tests & Pathology", queryTerm: "diagnostic lab" },
      ],
    },
    {
      type: "Pharmacies",
      subtypes: [
        { subtype: "24hr Pharmacy", queryTerm: "pharmacy" },
      ],
    },
  ],
};
