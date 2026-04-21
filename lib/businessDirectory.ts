// ─── Business taxonomy: Industry → Type → Subtypes ──────────────────────────
//
// Type  = the primary offering category (Coffeehouse, Restaurant, Saloon …)
// Subtype = what you can specifically do/get there (Pickleball Arena, Hair Saloon …)
//
// A business picks ONE industry, ONE OR MORE types, and any subtypes per type.

export const TAXONOMY: Record<string, Record<string, string[]>> = {
  "Food & Beverages": {
    "Coffeehouse": [
      "Specialty Coffee",
      "Cold Brew",
      "Tea Lounge",
      "Juice Bar",
      "Pickleball Arena",
      "Workspace / Co-Working",
      "Live Music",
      "Rooftop Seating",
      "Board Games",
    ],
    "Restaurant": [
      "North Indian",
      "South Indian",
      "Chinese",
      "Continental",
      "Pizza & Pasta",
      "Biryani",
      "Seafood",
      "Coastal",
      "Thai",
      "Lebanese",
      "Multi-Cuisine",
    ],
    "Bakery & Desserts": [
      "Artisan Bakery",
      "Patisserie",
      "Cake Shop",
      "Ice Cream Parlour",
      "Chocolatier",
    ],
    "Bar & Lounge": [
      "Cocktail Bar",
      "Sports Bar",
      "Rooftop Lounge",
      "Microbrewery",
      "Gastropub",
      "Wine Bar",
    ],
    "Sports Arena": [
      "Pickleball Courts",
      "Badminton Courts",
      "Cricket Nets",
      "Table Tennis",
      "Football / Futsal Turf",
      "Squash Courts",
      "Basketball Court",
      "Swimming Pool",
      "Bowling Alley",
    ],
    "Quick Service": [
      "Burgers",
      "Sandwiches & Wraps",
      "Indian Fast Food",
      "Healthy Bowls",
      "Cloud Kitchen",
    ],
  },

  "Health & Wellness": {
    "Hospital": [
      "Multi-Speciality Hospital",
      "Single Speciality Hospital",
    ],
    "Ambulance Services": [
      "Emergency Ambulance",
      "Patient Transport",
      "ICU Ambulance",
      "Neonatal Ambulance",
      "Air Ambulance",
    ],
    "Clinics": [
      "General Practice & Family Medicine",
      "Cardiology",
      "ENT (Ear, Nose & Throat)",
      "Ophthalmology",
      "Dermatology & Cosmetology",
      "Orthopaedics & Bone Care",
      "Gynaecology & Obstetrics",
      "Paediatrics & Child Care",
      "Neurology",
      "Oncology",
      "Urology",
      "Gastroenterology",
      "Pulmonology & Chest",
      "Nephrology & Kidney Care",
      "Endocrinology & Diabetes",
      "Psychiatry & Mental Health",
      "Dental & Orthodontics",
      "Physiotherapy & Rehabilitation",
      "Radiology & Imaging",
      "Pathology & Diagnostics",
      "Plastic & Cosmetic Surgery",
      "Haematology",
      "Rheumatology",
      "Geriatrics & Elder Care",
      "Sports Medicine",
      "Allergy & Immunology",
      "Ayurveda & Holistic",
      "Homeopathy",
    ],
    "Diagnostics": [
      "Blood Tests & Pathology",
      "Imaging & Radiology",
      "Full Body Checkup",
      "Cardiac Diagnostics",
      "Home Sample Collection",
    ],
    "Pharmacies": [
      "24hr Pharmacy",
      "Online Pharmacy",
      "Compounding Pharmacy",
      "Ayurvedic & Herbal",
    ],
    "Saloon": [
      "Hair Saloon",
      "Nails Spa",
      "Barber Shop",
      "Bridal Studio",
      "Unisex Saloon",
      "Skin & Facial",
      "Waxing & Threading",
    ],
    "Gym & Fitness": [
      "CrossFit",
      "Yoga",
      "Pilates",
      "General Gym",
      "Dance & Zumba",
      "Martial Arts",
      "Functional Training",
    ],
    "Wellness": [
      "Meditation & Mindfulness",
      "Nutrition & Diet Counselling",
      "Naturopathy",
      "Acupuncture",
      "Chiropractic Care",
      "Sound Therapy",
      "Reiki & Energy Healing",
      "Hypnotherapy",
      "Life Coaching & Wellness Coaching",
      "Detox & Cleanse Programs",
      "Pranayama & Breathwork",
      "Marma Therapy",
      "Yoga Studio",
      "Bicycling Studio",
      "Dance Studio",
      "Massage Spa",
      "Personal Trainers",
      "Aromatherapy",
      "Reflexology",
    ],
    "Old Age Care": [
      "At Home",
      "At Facilities",
    ],
    "Rehabilitation": [
      "Orthopaedic",
    ],
    "Spa & Relaxation": [
      "Ayurvedic Spa",
      "Thai Massage",
      "Beauty Spa",
      "Aromatherapy",
      "Reflexology",
      "Deep Tissue Massage",
    ],
  },

  "Retail": {
    "Fashion": [
      "Men's Wear",
      "Women's Wear",
      "Kids' Wear",
      "Accessories",
      "Footwear",
      "Ethnic Wear",
      "Sportswear",
    ],
    "Electronics": [
      "Mobiles & Accessories",
      "Laptops & Computers",
      "Home Appliances",
      "Gadgets",
      "Camera & Audio",
    ],
    "Home & Living": [
      "Furniture",
      "Lighting",
      "Art & Decor",
      "Kitchenware",
      "Bed & Bath",
    ],
    "Gifts & Collectibles": [
      "Gift Shop",
      "Collectibles & Figurines",
      "Souvenirs & Memorabilia",
      "Handcrafted & Artisanal",
      "Stationery & Journals",
      "Toys & Puzzles",
      "Seasonal & Festival Gifts",
      "Corporate Gifts",
      "Antiques & Vintage",
      "Art Prints & Posters",
    ],
    "Grocery & Supermarket": [
      "Supermarket",
      "Organic Store",
      "Specialty Foods",
      "Dairy & Bakery",
    ],
  },

  "Services": {
    "Moving": [
      "Movers & Packers",
    ],
    "Party": [
      "Party Planners",
      "Catering",
      "Makeup",
      "Decoration",
      "Photography",
      "Cakes & Desserts",
    ],
    "Home": [
      "Cleaning",
      "Home Repairs",
      "Pest Control",
      "Plumbing",
      "Interior",
      "Elevators",
      "Air Conditioning",
      "Dishwasher",
      "Washing Machine",
      "Dryer",
    ],
    "Delivery": [
      "Local Courier",
      "Grocery Delivery",
      "Medicine Delivery",
      "Laundry",
    ],
    "Driving": [
      "Monthly Driver",
      "Hourly Driver",
      "On-Demand Driver",
      "School Drop",
      "Airport Transfer",
      "Outstation",
    ],
  },

  "Education": {
    "Schools": [
      "IB (International Baccalaureate)",
      "CBSE",
      "Cambridge (IGCSE / A-Levels)",
      "ICSE",
      "State Board",
      "Montessori",
    ],
    "Day Care": [
      "Infant & Toddler Care",
      "Full-Day Care",
      "Half-Day Care",
      "After-School Care",
      "Weekend Care",
      "Nursery",
    ],
    "Coaching & Tuition": [
      "Academic Tuition",
      "Competitive Exam Prep",
      "Language Classes",
      "Skill Development",
      "Music Academy",
      "Art Classes",
      "Sports Coaching",
    ],
  },

};

export function getIndustries(): string[] {
  return Object.keys(TAXONOMY);
}

export function getTypes(industry: string): string[] {
  return Object.keys(TAXONOMY[industry] ?? {});
}

export function getSubtypes(industry: string, type: string): string[] {
  return TAXONOMY[industry]?.[type] ?? [];
}

/** All subtypes for a set of types within an industry, keyed by type name */
export function getSubtypesByTypes(
  industry: string,
  types: string[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const t of types) {
    const subs = getSubtypes(industry, t);
    if (subs.length > 0) result[t] = subs;
  }
  return result;
}
