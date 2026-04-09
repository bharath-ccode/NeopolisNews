"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Phone,
  MessageCircle,
  Bed,
  Maximize2,
  Car,
  MapPin,
  SlidersHorizontal,
  PlusCircle,
  Building2,
} from "lucide-react";
import clsx from "clsx";
import { getListings, PROJECTS, type Listing } from "@/lib/listings";

// Seed listings shown when no user-posted data exists yet
const SEED_LISTINGS: Listing[] = [
  {
    id: "seed-1",
    userId: "seed",
    ownerName: "Rajesh Kumar",
    contactPhone: "9876543210",
    projectId: "apex-tower",
    projectName: "Neopolis Apex Tower",
    tower: "Apex Tower – Tower B",
    floor: "24",
    unit: "B-2401",
    listingType: "rent",
    propertyType: "apartment",
    bedrooms: "3",
    bathrooms: "3",
    carpetArea: "1450",
    parking: "1",
    furnished: "fully-furnished",
    price: "55,000",
    deposit: "1,65,000",
    availableFrom: "2026-05-01",
    amenities: ["Gym", "Swimming Pool", "Club House", "CCTV"],
    description:
      "Stunning 3 BHK with panoramic city views. Fully furnished with premium fittings. Quiet floor, excellent ventilation.",
    status: "active",
    postedOn: new Date(Date.now() - 2 * 86400000).toISOString(),
    views: 142,
    enquiries: 8,
  },
  {
    id: "seed-2",
    userId: "seed",
    ownerName: "Priya Sharma",
    contactPhone: "9845001122",
    projectId: "neopolis-heights",
    projectName: "Neopolis Heights",
    tower: "Neopolis Heights – Tower A",
    floor: "12",
    unit: "A-1204",
    listingType: "sale",
    propertyType: "apartment",
    bedrooms: "2",
    bathrooms: "2",
    carpetArea: "980",
    parking: "1",
    furnished: "semi-furnished",
    price: "1,40,00,000",
    deposit: "",
    availableFrom: "",
    amenities: ["Swimming Pool", "Gymnasium", "Kids Play Area", "Security"],
    description:
      "Well-maintained 2 BHK. Original allottee, no broker fees. Immediate possession available.",
    status: "active",
    postedOn: new Date(Date.now() - 5 * 86400000).toISOString(),
    views: 89,
    enquiries: 3,
  },
  {
    id: "seed-3",
    userId: "seed",
    ownerName: "Arjun Mehta",
    contactPhone: "9900112233",
    projectId: "apex-tower",
    projectName: "Neopolis Apex Tower",
    tower: "Apex Tower – Tower A",
    floor: "8",
    unit: "A-0805",
    listingType: "rent",
    propertyType: "apartment",
    bedrooms: "1",
    bathrooms: "1",
    carpetArea: "650",
    parking: "0",
    furnished: "semi-furnished",
    price: "28,000",
    deposit: "56,000",
    availableFrom: "2026-04-15",
    amenities: ["Lift", "Security", "Power Backup"],
    description:
      "Compact 1 BHK, ideal for working professionals. Walking distance to Business Park.",
    status: "active",
    postedOn: new Date(Date.now() - 8 * 86400000).toISOString(),
    views: 56,
    enquiries: 4,
  },
  {
    id: "seed-4",
    userId: "seed",
    ownerName: "Sunita Verma",
    contactPhone: "9712345678",
    projectId: "sky-residences",
    projectName: "Sky Residences by Neopolis",
    tower: "Sky Residences – Tower 1",
    floor: "38",
    unit: "S-3802",
    listingType: "sale",
    propertyType: "apartment",
    bedrooms: "4",
    bathrooms: "4",
    carpetArea: "3200",
    parking: "2",
    furnished: "fully-furnished",
    price: "8,50,00,000",
    deposit: "",
    availableFrom: "",
    amenities: ["Rooftop Terrace", "Swimming Pool", "Club House", "Co-Working Space", "Gym"],
    description:
      "Ultra-luxury 4 BHK penthouse-style apartment with private terrace. Rarely available floor.",
    status: "active",
    postedOn: new Date(Date.now() - 1 * 86400000).toISOString(),
    views: 210,
    enquiries: 12,
  },
  {
    id: "seed-5",
    userId: "seed",
    ownerName: "Mohammed Farhan",
    contactPhone: "9988776655",
    projectId: "neopolis-heights",
    projectName: "Neopolis Heights",
    tower: "Neopolis Heights – Tower B",
    floor: "5",
    unit: "B-0503",
    listingType: "rent",
    propertyType: "apartment",
    bedrooms: "2",
    bathrooms: "2",
    carpetArea: "1100",
    parking: "1",
    furnished: "unfurnished",
    price: "32,000",
    deposit: "96,000",
    availableFrom: "2026-04-20",
    amenities: ["Lift", "Security", "Garden", "Kids Play Area"],
    description:
      "Spacious 2 BHK in a family-friendly tower. Unfurnished — bring your own style.",
    status: "active",
    postedOn: new Date(Date.now() - 3 * 86400000).toISOString(),
    views: 74,
    enquiries: 5,
  },
];

export default function ClassifiedsPage() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filterProject, setFilterProject] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "rent" | "sale">("all");
  const [filterBHK, setFilterBHK] = useState("all");

  useEffect(() => {
    const stored = getListings().filter((l) => l.status === "active");
    // Merge: stored listings first, then seeds not overridden by stored
    const storedIds = new Set(stored.map((l) => l.id));
    const seeds = SEED_LISTINGS.filter((s) => !storedIds.has(s.id));
    setAllListings([...stored, ...seeds]);
  }, []);

  const filtered = allListings.filter((l) => {
    if (filterProject !== "all" && l.projectId !== filterProject) return false;
    if (filterType !== "all" && l.listingType !== filterType) return false;
    if (filterBHK !== "all" && l.bedrooms !== filterBHK) return false;
    return true;
  });

  function formatPrice(l: Listing) {
    return `₹${l.price}${l.listingType === "rent" ? "/mo" : ""}`;
  }

  function daysAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "Today";
    if (d === 1) return "Yesterday";
    return `${d} days ago`;
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="tag-blue mb-4 inline-block">Owner Listings</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-3">
            Flats for Sale &amp; Rent
          </h1>
          <p className="text-brand-200 text-base mb-6 max-w-xl">
            Direct from owners in the Neopolis district — no brokerage, verified
            listings, instant contact.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/login?next=/dashboard/individual/post" className="btn-primary">
              <PlusCircle className="w-4 h-4" /> Post Your Property Free
            </Link>
            <Link href="/real-estate" className="btn-secondary border-brand-500 text-brand-300 hover:bg-brand-800">
              Back to Real Estate
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />

          {/* Project filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Projects</option>
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["all", "rent", "sale"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-semibold transition-colors capitalize",
                  filterType === t
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {t === "all" ? "All" : t === "rent" ? "Rent" : "Sale"}
              </button>
            ))}
          </div>

          {/* BHK filter */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {["all", "1", "2", "3", "4"].map((b) => (
              <button
                key={b}
                onClick={() => setFilterBHK(b)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-semibold transition-colors",
                  filterBHK === b
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {b === "all" ? "Any BHK" : `${b} BHK`}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Listings grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No listings match your filters</p>
            <button
              onClick={() => {
                setFilterProject("all");
                setFilterType("all");
                setFilterBHK("all");
              }}
              className="btn-secondary text-sm mt-4"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((l) => (
              <div key={l.id} className="card overflow-hidden flex flex-col">
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center relative">
                  <Building2 className="w-12 h-12 text-brand-300" />
                  <span
                    className={clsx(
                      "absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full",
                      l.listingType === "rent"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    )}
                  >
                    For {l.listingType === "rent" ? "Rent" : "Sale"}
                  </span>
                  <span className="absolute top-3 right-3 text-xs text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
                    {daysAgo(l.postedOn)}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Project + location */}
                  <div className="flex items-start gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-brand-600 font-semibold leading-snug">
                      {l.projectName} · {l.tower}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">
                    {l.propertyType === "apartment" || l.propertyType === "villa"
                      ? `${l.bedrooms} BHK ${l.propertyType.charAt(0).toUpperCase() + l.propertyType.slice(1)}`
                      : l.propertyType.charAt(0).toUpperCase() + l.propertyType.slice(1)}
                    {" — "}Floor {l.floor}
                    {l.unit ? `, ${l.unit}` : ""}
                  </h3>

                  {/* Specs row */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {(l.propertyType === "apartment" || l.propertyType === "villa") && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" /> {l.bedrooms} Bed
                      </span>
                    )}
                    {l.carpetArea && (
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" /> {l.carpetArea} sq ft
                      </span>
                    )}
                    {l.parking && l.parking !== "0" && (
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" /> {l.parking} Parking
                      </span>
                    )}
                  </div>

                  {/* Furnished + amenities */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">
                      {l.furnished.replace(/-/g, " ")}
                    </span>
                    {l.amenities.slice(0, 2).map((a) => (
                      <span
                        key={a}
                        className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                      >
                        {a}
                      </span>
                    ))}
                    {l.amenities.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{l.amenities.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {l.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {l.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mt-auto">
                    <p className="text-xl font-extrabold text-brand-700 mb-1">
                      {formatPrice(l)}
                    </p>
                    {l.listingType === "rent" && l.deposit && (
                      <p className="text-xs text-gray-400 mb-3">
                        Deposit ₹{l.deposit}
                      </p>
                    )}

                    {/* Owner + contact */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                          {l.ownerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {l.ownerName}
                          </p>
                          <p className="text-xs text-gray-400">Owner</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`tel:+91${l.contactPhone}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <a
                          href={`https://wa.me/91${l.contactPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA to post */}
        <div className="mt-12 rounded-2xl bg-brand-50 border border-brand-100 p-8 text-center">
          <Home className="w-10 h-10 text-brand-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Have a property to list?</h3>
          <p className="text-sm text-gray-500 mb-4">
            Post for free — no brokerage, direct contact with buyers &amp; tenants.
          </p>
          <Link href="/dashboard/individual/post" className="btn-primary text-sm">
            <PlusCircle className="w-4 h-4" /> Post Your Property
          </Link>
        </div>
      </div>
    </>
  );
}
