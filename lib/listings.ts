// Shared project data, listing types, and localStorage helpers

export interface Project {
  id: string;
  name: string;
  type: string;
  towers: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "apex-tower",
    name: "Neopolis Apex Tower",
    type: "Luxury Residential",
    towers: ["Apex Tower – Tower A", "Apex Tower – Tower B", "Apex Tower – Tower C"],
  },
  {
    id: "neopolis-heights",
    name: "Neopolis Heights",
    type: "Premium Residential",
    towers: ["Neopolis Heights – Tower A", "Neopolis Heights – Tower B"],
  },
  {
    id: "sky-residences",
    name: "Sky Residences by Neopolis",
    type: "Ultra-Luxury Residential",
    towers: ["Sky Residences – Tower 1", "Sky Residences – Tower 2"],
  },
  {
    id: "business-park",
    name: "Neopolis Business Park",
    type: "Grade A Office",
    towers: ["Business Park – Block A", "Business Park – Block B"],
  },
  {
    id: "grand-mall",
    name: "Neopolis Grand Mall",
    type: "Retail & Entertainment",
    towers: ["Grand Mall – Zone A", "Grand Mall – Zone B"],
  },
];

export const AMENITIES_LIST = [
  "Gym",
  "Swimming Pool",
  "Club House",
  "Power Backup",
  "Lift",
  "Security",
  "CCTV",
  "Parking",
  "Garden",
  "Kids Play Area",
  "Co-Working Space",
  "Rooftop Terrace",
];

export type ListingType = "rent" | "sale";
export type PropertyType = "apartment" | "villa" | "office" | "shop" | "plot";
export type FurnishedStatus = "unfurnished" | "semi-furnished" | "fully-furnished";
export type ListingStatus = "active" | "inactive";

export interface Listing {
  id: string;
  userId: string;
  ownerName: string;
  contactPhone: string;
  projectId: string;
  projectName: string;
  tower: string;
  floor: string;
  unit: string;
  listingType: ListingType;
  propertyType: PropertyType;
  bedrooms: string;
  bathrooms: string;
  carpetArea: string;
  parking: string;
  furnished: FurnishedStatus;
  price: string;
  deposit: string;
  availableFrom: string;
  amenities: string[];
  description: string;
  status: ListingStatus;
  postedOn: string; // ISO date string
  views: number;
  enquiries: number;
}

const LS_KEY = "neopolis_listings";

export function getListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getUserListings(userId: string): Listing[] {
  return getListings().filter((l) => l.userId === userId);
}

export function saveListing(listing: Listing): void {
  const all = getListings();
  const idx = all.findIndex((l) => l.id === listing.id);
  if (idx >= 0) all[idx] = listing;
  else all.unshift(listing);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

export function updateListing(id: string, patch: Partial<Listing>): void {
  const all = getListings();
  const idx = all.findIndex((l) => l.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  }
}

export function deleteListing(id: string): void {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify(getListings().filter((l) => l.id !== id))
  );
}
