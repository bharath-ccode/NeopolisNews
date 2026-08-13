import type { DiscoveryIndustryConfig } from "./types";

// lib/businessDirectory.ts TAXONOMY["Health & Wellness"] — only the
// subtypes worth Places-searching get a queryTerm here; the rest of that
// taxonomy (e.g. "Old Age Care") isn't a good Places search target.
//
// Ambulance Services, Saloon, Gym & Fitness, Old Age Care, Rehabilitation,
// and Spa & Relaxation exist in the taxonomy but aren't configured here
// yet — add a `type` block the same way if/when wanted.
export const HEALTH_DISCOVERY: DiscoveryIndustryConfig = {
  industry: "Health & Wellness",
  types: [
    {
      type: "Hospital",
      subtypes: [
        { subtype: "Multi-Speciality Hospital", queryTerm: "multi speciality hospital" },
        { subtype: "Single Speciality Hospital", queryTerm: "speciality hospital" },
      ],
    },
    {
      // Every TAXONOMY["Health & Wellness"]["Clinics"] subtype — all of
      // them are legitimate, distinct Places search targets.
      type: "Clinics",
      subtypes: [
        { subtype: "General Practice & Family Medicine",  queryTerm: "general physician clinic" },
        { subtype: "Cardiology",                          queryTerm: "cardiology clinic" },
        { subtype: "ENT (Ear, Nose & Throat)",             queryTerm: "ENT clinic" },
        { subtype: "Ophthalmology",                        queryTerm: "eye clinic" },
        { subtype: "Dermatology & Cosmetology",            queryTerm: "dermatology clinic" },
        { subtype: "Orthopaedics & Bone Care",             queryTerm: "orthopedic clinic" },
        { subtype: "Gynaecology & Obstetrics",             queryTerm: "gynaecology clinic" },
        { subtype: "Paediatrics & Child Care",             queryTerm: "paediatric clinic" },
        { subtype: "Neurology",                            queryTerm: "neurology clinic" },
        { subtype: "Oncology",                             queryTerm: "oncology clinic" },
        { subtype: "Urology",                              queryTerm: "urology clinic" },
        { subtype: "Gastroenterology",                     queryTerm: "gastroenterology clinic" },
        { subtype: "Pulmonology & Chest",                  queryTerm: "pulmonology clinic" },
        { subtype: "Nephrology & Kidney Care",              queryTerm: "nephrology clinic" },
        { subtype: "Endocrinology & Diabetes",              queryTerm: "diabetes clinic" },
        { subtype: "Psychiatry & Mental Health",            queryTerm: "psychiatry clinic" },
        { subtype: "Dental & Orthodontics",                 queryTerm: "dental clinic" },
        { subtype: "Physiotherapy & Rehabilitation",        queryTerm: "physiotherapy clinic" },
        { subtype: "Radiology & Imaging",                   queryTerm: "radiology imaging center" },
        { subtype: "Pathology & Diagnostics",               queryTerm: "pathology lab" },
        { subtype: "Plastic & Cosmetic Surgery",            queryTerm: "cosmetic surgery clinic" },
        { subtype: "Haematology",                           queryTerm: "haematology clinic" },
        { subtype: "Rheumatology",                          queryTerm: "rheumatology clinic" },
        { subtype: "Geriatrics & Elder Care",               queryTerm: "geriatric clinic" },
        { subtype: "Sports Medicine",                       queryTerm: "sports medicine clinic" },
        { subtype: "Allergy & Immunology",                  queryTerm: "allergy clinic" },
        { subtype: "Ayurveda & Holistic",                   queryTerm: "ayurveda clinic" },
        { subtype: "Homeopathy",                            queryTerm: "homeopathy clinic" },
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
    {
      // TAXONOMY["Health & Wellness"]["Wellness"] has 20 subtypes; the
      // ones below are the subset that map to a distinct, independently
      // findable business on Places. Skipped: Personal Trainers,
      // Pranayama & Breathwork, Aromatherapy, Reflexology, Sound Therapy,
      // Hypnotherapy, Life Coaching & Wellness Coaching, Detox & Cleanse
      // Programs, Bicycling Studio, Marma Therapy — these are typically a
      // service offered inside a spa/studio rather than their own listed
      // place, or an individual practitioner Places search doesn't surface.
      type: "Wellness",
      subtypes: [
        { subtype: "Massage Spa",                      queryTerm: "massage spa" },
        { subtype: "Gym",                               queryTerm: "gym" },
        { subtype: "Yoga Studio",                       queryTerm: "yoga studio" },
        { subtype: "Dance Studio",                      queryTerm: "dance studio" },
        { subtype: "Meditation & Mindfulness",          queryTerm: "meditation center" },
        { subtype: "Nutrition & Diet Counselling",      queryTerm: "dietician clinic" },
        { subtype: "Naturopathy",                       queryTerm: "naturopathy clinic" },
        { subtype: "Acupuncture",                       queryTerm: "acupuncture clinic" },
        { subtype: "Chiropractic Care",                 queryTerm: "chiropractor" },
        { subtype: "Reiki & Energy Healing",            queryTerm: "reiki healing center" },
      ],
    },
  ],
};
