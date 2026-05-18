export interface AmenityCategory {
  category: string;
  items: string[];
}

export const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    category: "Club & Lounge",
    items: [
      "Grand Clubhouse",
      "Lounge Area",
      "Coffee Lounge",
      "Cigar Lounge",
      "Card Room",
      "Stargazing Lounge",
      "Terrace Lounge",
      "Reading Lounge / TV Room",
      "Gaming Zone",
      "Hang Out Spaces",
      "Conversations & Coffee Lounge",
      "Poolside Cabana",
    ],
  },
  {
    category: "Wellness & Fitness",
    items: [
      "Swimming Pool",
      "Infinity Pool",
      "Luxury Spa / Salon",
      "Fitness Centre (Gym)",
      "Crossfit",
      "Yoga / Meditation Studio",
      "Aerobics Room",
      "Outdoor Gym",
      "Juice Bar",
      "Acupressure Walk",
    ],
  },
  {
    category: "Sports",
    items: [
      "Tennis Court",
      "Badminton Court",
      "Basketball Court",
      "Squash Court",
      "Volleyball Court",
      "Net Cricket",
      "Jogging & Cycling Track",
      "Boxing Corner",
    ],
  },
  {
    category: "Entertainment",
    items: [
      "Mini Theatre",
      "Dance Studio",
      "Art Gallery",
      "Music Room",
      "Barbeque Area",
      "Banquet Hall with Party Lawn",
      "Amphitheatre",
      "Poolside Party Area",
    ],
  },
  {
    category: "Convenience & Services",
    items: [
      "Concierge Desk",
      "Smart Bank / ATM",
      "Convenience Store",
      "Smart Laundry",
      "Car Wash Facility",
      "Guest Rooms",
      "House Keeping Service",
      "Maids / Drivers & Care Givers Lounge",
      "Senior Citizen Corner",
      "Concierge & Bell Desk",
    ],
  },
  {
    category: "Health & Medical",
    items: [
      "Health Clinic",
      "Pharmacy",
      "Emergency Health Care",
      "Acupressure Walk",
    ],
  },
  {
    category: "Business Center",
    items: [
      "Co-working Stations",
      "Meeting Rooms",
      "Conference Hall",
      "Library",
    ],
  },
  {
    category: "Kids",
    items: [
      "Kids Play Zone",
      "Sand Play Area",
      "Creche",
      "Digital / Smart Classroom",
      "School Bus Bay",
    ],
  },
  {
    category: "Pets",
    items: [
      "Pet Hostel",
      "Kennel Care",
      "Pet Grooming",
      "Pet SPA",
    ],
  },
  {
    category: "Outdoor & Landscape",
    items: [
      "Thematic Landscapes",
      "Waterbodies / Sculptures",
      "Landscaped Gardens",
      "Jogging Track",
      "Cycling Track",
    ],
  },
  {
    category: "Infrastructure & Safety",
    items: [
      "EV Charging",
      "100% Power Backup",
      "Water Softening Plant",
      "Sewage Treatment Plant",
      "CCTV Security",
      "Biometric Access",
      "Home Automation",
      "High-Speed Lifts",
      "Solar Lighting",
      "Rainwater Harvesting",
    ],
  },
];

export const ALL_AMENITIES: string[] = AMENITY_CATEGORIES.flatMap((c) => c.items);
