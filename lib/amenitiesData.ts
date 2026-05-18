import type { LucideIcon } from "lucide-react";
import {
  Building2, Armchair, Coffee, Flame, Grid3x3, Star, Sun, Tv, Gamepad2,
  Users, MessageCircle, Umbrella, Waves, Sparkles, Dumbbell, Zap, Wind,
  Activity, Leaf, Timer, Bike, Film, Music, Image, Mic, ShoppingCart,
  Bell, CreditCard, Car, Bed, Home, Heart, Monitor, BookOpen, Smile,
  Scissors, Bus, TreePine, Droplets, Camera, Fingerprint, BatteryCharging,
  Battery, ArrowUpDown, Plus, AlertCircle, Shield,
} from "lucide-react";

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

export const AMENITY_ICONS: Record<string, LucideIcon> = {
  // Club & Lounge
  "Grand Clubhouse":                  Building2,
  "Lounge Area":                      Armchair,
  "Coffee Lounge":                    Coffee,
  "Cigar Lounge":                     Flame,
  "Card Room":                        Grid3x3,
  "Stargazing Lounge":                Star,
  "Terrace Lounge":                   Sun,
  "Reading Lounge / TV Room":         Tv,
  "Gaming Zone":                      Gamepad2,
  "Hang Out Spaces":                  Users,
  "Conversations & Coffee Lounge":    MessageCircle,
  "Poolside Cabana":                  Umbrella,

  // Wellness & Fitness
  "Swimming Pool":                    Waves,
  "Infinity Pool":                    Waves,
  "Luxury Spa / Salon":               Sparkles,
  "Fitness Centre (Gym)":             Dumbbell,
  "Crossfit":                         Zap,
  "Yoga / Meditation Studio":         Wind,
  "Aerobics Room":                    Activity,
  "Outdoor Gym":                      Dumbbell,
  "Juice Bar":                        Leaf,
  "Acupressure Walk":                 Leaf,

  // Sports
  "Tennis Court":                     Activity,
  "Badminton Court":                  Activity,
  "Basketball Court":                 Activity,
  "Squash Court":                     Activity,
  "Volleyball Court":                 Activity,
  "Net Cricket":                      Activity,
  "Jogging & Cycling Track":          Bike,
  "Boxing Corner":                    Shield,

  // Entertainment
  "Mini Theatre":                     Film,
  "Dance Studio":                     Music,
  "Art Gallery":                      Image,
  "Music Room":                       Music,
  "Barbeque Area":                    Flame,
  "Banquet Hall with Party Lawn":     Star,
  "Amphitheatre":                     Mic,
  "Poolside Party Area":              Waves,

  // Convenience & Services
  "Concierge Desk":                   Bell,
  "Smart Bank / ATM":                 CreditCard,
  "Convenience Store":                ShoppingCart,
  "Smart Laundry":                    Wind,
  "Car Wash Facility":                Car,
  "Guest Rooms":                      Bed,
  "House Keeping Service":            Home,
  "Maids / Drivers & Care Givers Lounge": Users,
  "Senior Citizen Corner":            Heart,
  "Concierge & Bell Desk":            Bell,

  // Health & Medical
  "Health Clinic":                    Plus,
  "Pharmacy":                         Plus,
  "Emergency Health Care":            AlertCircle,

  // Business Center
  "Co-working Stations":              Monitor,
  "Meeting Rooms":                    Users,
  "Conference Hall":                  Monitor,
  "Library":                          BookOpen,

  // Kids
  "Kids Play Zone":                   Smile,
  "Sand Play Area":                   Sun,
  "Creche":                           Heart,
  "Digital / Smart Classroom":        Monitor,
  "School Bus Bay":                   Bus,

  // Pets
  "Pet Hostel":                       Home,
  "Kennel Care":                      Heart,
  "Pet Grooming":                     Scissors,
  "Pet SPA":                          Sparkles,

  // Outdoor & Landscape
  "Thematic Landscapes":              TreePine,
  "Waterbodies / Sculptures":         Waves,
  "Landscaped Gardens":               TreePine,
  "Jogging Track":                    Timer,
  "Cycling Track":                    Bike,

  // Infrastructure & Safety
  "EV Charging":                      BatteryCharging,
  "100% Power Backup":                Battery,
  "Water Softening Plant":            Droplets,
  "Sewage Treatment Plant":           Droplets,
  "CCTV Security":                    Camera,
  "Biometric Access":                 Fingerprint,
  "Home Automation":                  Home,
  "High-Speed Lifts":                 ArrowUpDown,
  "Solar Lighting":                   Sun,
  "Rainwater Harvesting":             Droplets,
};
