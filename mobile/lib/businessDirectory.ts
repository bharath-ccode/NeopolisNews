export const TAXONOMY: Record<string, Record<string, string[]>> = {
  "Entertainment": {
    "Cinema": ["Multiplex", "IMAX", "4DX", "Dolby Atmos", "Single Screen"],
  },
  "Events": {
    "Event Spaces": ["Convention Centre", "Banquet Hall", "Outdoor Space"],
  },
  "Food & Beverages": {
    "Coffeehouse": ["Specialty Coffee", "Cold Brew", "Tea Lounge", "Juice Bar", "Pickleball Arena", "Workspace / Co-Working", "Live Music", "Rooftop Seating", "Board Games"],
    "Restaurant": ["North Indian", "South Indian", "Chinese", "Continental", "Pizza & Pasta", "Biryani", "Seafood", "Coastal", "Thai", "Lebanese", "Multi-Cuisine"],
    "Bakery & Desserts": ["Artisan Bakery", "Patisserie", "Cake Shop", "Ice Cream Parlour", "Chocolatier"],
    "Bar & Lounge": ["Cocktail Bar", "Sports Bar", "Rooftop Lounge", "Microbrewery", "Gastropub", "Wine Bar"],
    "Sports Arena": ["Pickleball Courts", "Badminton Courts", "Cricket Nets", "Table Tennis", "Football / Futsal Turf", "Squash Courts", "Basketball Court", "Swimming Pool", "Bowling Alley"],
    "Quick Service": ["Burgers", "Sandwiches & Wraps", "Indian Fast Food", "Healthy Bowls", "Cloud Kitchen"],
  },
  "Health & Wellness": {
    "Hospital": ["Multi-Speciality Hospital", "Single Speciality Hospital"],
    "Ambulance Services": ["Emergency Ambulance", "Patient Transport", "ICU Ambulance", "Neonatal Ambulance", "Air Ambulance"],
    "Clinics": ["General Practice & Family Medicine", "Cardiology", "ENT (Ear, Nose & Throat)", "Ophthalmology", "Dermatology & Cosmetology", "Orthopaedics & Bone Care", "Gynaecology & Obstetrics", "Paediatrics & Child Care", "Neurology", "Oncology", "Urology", "Gastroenterology", "Pulmonology & Chest", "Nephrology & Kidney Care", "Endocrinology & Diabetes", "Psychiatry & Mental Health", "Dental & Orthodontics", "Physiotherapy & Rehabilitation", "Radiology & Imaging", "Pathology & Diagnostics"],
    "Diagnostics": ["Blood Tests & Pathology", "Imaging & Radiology", "Full Body Checkup", "Cardiac Diagnostics", "Home Sample Collection"],
    "Pharmacies": ["24hr Pharmacy", "Online Pharmacy", "Compounding Pharmacy", "Ayurvedic & Herbal"],
    "Saloon": ["Hair Saloon", "Nails Spa", "Barber Shop", "Bridal Studio", "Unisex Saloon", "Skin & Facial", "Waxing & Threading"],
    "Gym & Fitness": ["CrossFit", "Yoga", "Pilates", "General Gym", "Dance & Zumba", "Martial Arts", "Functional Training"],
    "Wellness": ["Massage Spa", "Yoga Studio", "Dance Studio", "Personal Trainers", "Meditation & Mindfulness", "Nutrition & Diet Counselling", "Naturopathy", "Acupuncture", "Aromatherapy", "Reflexology"],
    "Spa & Relaxation": ["Ayurvedic Spa", "Thai Massage", "Beauty Spa", "Deep Tissue Massage"],
  },
  "Retail": {
    "Fashion": ["Men's Wear", "Women's Wear", "Kids' Wear", "Accessories", "Footwear", "Ethnic Wear", "Sportswear"],
    "Electronics": ["Mobiles & Accessories", "Laptops & Computers", "Home Appliances", "Gadgets", "Camera & Audio"],
    "Home & Living": ["Furniture", "Lighting", "Art & Decor", "Kitchenware", "Bed & Bath"],
    "Gifts & Collectibles": ["Gift Shop", "Collectibles & Figurines", "Handcrafted & Artisanal", "Stationery & Journals", "Toys & Puzzles", "Corporate Gifts"],
    "Grocery & Supermarket": ["Supermarket", "Organic Store", "Specialty Foods", "Dairy & Bakery"],
  },
  "Services": {
    "Moving": ["Movers & Packers"],
    "Party": ["Party Planners", "Catering", "Makeup", "Decoration", "Photography", "Cakes & Desserts"],
    "Home": ["Cleaning", "Home Repairs", "Pest Control", "Plumbing", "Interior", "Air Conditioning"],
    "Delivery": ["Local Courier", "Grocery Delivery", "Medicine Delivery", "Laundry"],
    "Driving": ["Monthly Driver", "Hourly Driver", "On-Demand Driver", "Airport Transfer", "Outstation"],
  },
  "Education": {
    "Schools": ["IB (International Baccalaureate)", "CBSE", "Cambridge (IGCSE / A-Levels)", "ICSE", "State Board", "Montessori"],
    "Day Care": ["Infant & Toddler Care", "Full-Day Care", "Half-Day Care", "After-School Care", "Nursery"],
    "Coaching & Tuition": ["Academic Tuition", "Competitive Exam Prep", "Language Classes", "Music Academy", "Art Classes", "Sports Coaching"],
  },
};

export const INDUSTRY_EMOJI: Record<string, string> = {
  "Food & Beverages":  "🍽️",
  "Health & Wellness": "❤️",
  "Retail":            "🛍️",
  "Services":          "🔧",
  "Education":         "📚",
  "Entertainment":     "🎬",
  "Events":            "🎉",
};

export function getIndustries(): string[] { return Object.keys(TAXONOMY); }
export function getTypes(industry: string): string[] { return Object.keys(TAXONOMY[industry] ?? {}); }
export function getSubtypes(industry: string, type: string): string[] { return TAXONOMY[industry]?.[type] ?? []; }
