"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  PartyPopper,
  Home,
  ShoppingBag,
  Car,
  MapPin,
  Phone,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  IndianRupee,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

type ServiceType = "moving" | "party" | "home" | "delivery" | "driving";

const TABS: { id: ServiceType; label: string; icon: React.ElementType; color: string; accent: string }[] = [
  { id: "moving",   label: "Moving",   icon: Truck,        color: "bg-orange-50 text-orange-600",  accent: "border-orange-400 text-orange-700" },
  { id: "party",    label: "Party",    icon: PartyPopper,  color: "bg-pink-50 text-pink-600",      accent: "border-pink-400 text-pink-700"    },
  { id: "home",     label: "Home",     icon: Home,         color: "bg-teal-50 text-teal-600",      accent: "border-teal-400 text-teal-700"    },
  { id: "delivery", label: "Delivery", icon: ShoppingBag,  color: "bg-blue-50 text-blue-600",      accent: "border-blue-400 text-blue-700"    },
  { id: "driving",  label: "Driving",  icon: Car,          color: "bg-purple-50 text-purple-600",  accent: "border-purple-400 text-purple-700"},
];

interface Provider {
  name: string;
  type: ServiceType;
  subtype: string;
  area: string;
  phone: string;
  availability: string;
  rating: number;
  priceHint: string;
  tags: string[];
}

const PROVIDERS: Provider[] = [
  // ── Moving ────────────────────────────────────────────────────────────────
  { name: "SafeMove Packers & Movers",       type: "moving",   subtype: "Packers & Movers",  area: "Neopolis & Kokapet",         phone: "+91 90003 10001", availability: "Mon – Sun, 7 AM – 8 PM",  rating: 4.8, priceHint: "From ₹3,500",  tags: ["Household Shifting", "Bubble Wrap Packing", "Transit Insurance"] },
  { name: "QuickShift Relocation",           type: "moving",   subtype: "Packers & Movers",  area: "Hyderabad Wide",             phone: "+91 90003 10002", availability: "Mon – Sun, 6 AM – 9 PM",  rating: 4.7, priceHint: "From ₹2,800",  tags: ["Same-Day Move", "Office Relocation", "Vehicle Transport"]       },
  { name: "NeoMove Services",                type: "moving",   subtype: "Packers & Movers",  area: "Neopolis & Financial Dist.", phone: "+91 90003 10003", availability: "Mon – Sat, 8 AM – 7 PM",  rating: 4.6, priceHint: "From ₹2,500",  tags: ["Local Move", "Storage Available", "Dismantling & Assembly"]    },
  { name: "CityCarry Logistics",             type: "moving",   subtype: "Packers & Movers",  area: "All Hyderabad",              phone: "+91 90003 10004", availability: "24 / 7",                  rating: 4.5, priceHint: "From ₹4,000",  tags: ["Heavy Furniture", "Piano & Antiques", "Inter-City Move"]        },
  { name: "HomeShift Pro",                   type: "moving",   subtype: "Packers & Movers",  area: "Kokapet, Gachibowli",        phone: "+91 90003 10005", availability: "Mon – Sun, 7 AM – 9 PM",  rating: 4.7, priceHint: "From ₹3,000",  tags: ["Apartment Move", "Floor-to-Floor", "Careful Handling"]          },
  { name: "Express Movers Hyderabad",        type: "moving",   subtype: "Packers & Movers",  area: "Hyderabad & Secunderabad",   phone: "+91 90003 10006", availability: "Mon – Sun, 6 AM – 8 PM",  rating: 4.6, priceHint: "From ₹2,200",  tags: ["Tempo Hire", "Mini Truck", "Loading Help"]                      },

  // ── Party ─────────────────────────────────────────────────────────────────
  { name: "NeoCelebrations",                 type: "party",    subtype: "Party Planners",    area: "Neopolis Clubhouse & Home",  phone: "+91 90003 20001", availability: "Mon – Sun, 9 AM – 10 PM", rating: 4.9, priceHint: "From ₹8,000",  tags: ["Birthday Parties", "Themed Decor", "Balloon Arch"]              },
  { name: "Balloon & Decor Studio",          type: "party",    subtype: "Decor & Setup",     area: "Neopolis & Kokapet",         phone: "+91 90003 20002", availability: "Mon – Sun, 8 AM – 9 PM",  rating: 4.7, priceHint: "From ₹3,500",  tags: ["Balloon Bouquets", "Stage Decor", "Photo Booth"]                },
  { name: "CakeNBake Custom Cakes",          type: "party",    subtype: "Cakes & Desserts",  area: "Neopolis Delivery",          phone: "+91 90003 20003", availability: "Order 2 days ahead",      rating: 4.9, priceHint: "From ₹1,200",  tags: ["Custom Cakes", "Cupcakes", "Eggless Options"]                    },
  { name: "SnapFrame Event Photography",     type: "party",    subtype: "Photography",       area: "Neopolis & nearby",          phone: "+91 90003 20004", availability: "By appointment",          rating: 4.8, priceHint: "From ₹5,000",  tags: ["Birthday Shoots", "Candid Photos", "Reels & Video"]             },
  { name: "PartyPro Catering",               type: "party",    subtype: "Catering",          area: "Neopolis & Kokapet",         phone: "+91 90003 20005", availability: "Mon – Sun",               rating: 4.6, priceHint: "From ₹350/head",tags: ["Buffet", "Live Counter", "Kids Menu"]                            },
  { name: "KidZone Entertainment",           type: "party",    subtype: "Kids Entertainment",area: "Neopolis Clubhouse",         phone: "+91 90003 20006", availability: "Weekends & holidays",     rating: 4.8, priceHint: "From ₹4,000",  tags: ["Magician", "Face Painting", "Bouncy Castle"]                    },

  // ── Home ──────────────────────────────────────────────────────────────────
  { name: "CleanNeat Home Services",         type: "home",     subtype: "Cleaning",          area: "Neopolis All Towers",        phone: "+91 90003 30001", availability: "Mon – Sat, 7 AM – 6 PM",  rating: 4.8, priceHint: "From ₹799",    tags: ["Deep Clean", "Move-In Clean", "Regular Weekly"]                 },
  { name: "FixIt Pro Repairs",               type: "home",     subtype: "Home Repairs",      area: "Neopolis & Kokapet",         phone: "+91 90003 30002", availability: "Mon – Sun, 8 AM – 8 PM",  rating: 4.7, priceHint: "From ₹299",    tags: ["Plumbing", "Electrical", "Carpentry", "AC Service"]             },
  { name: "SparkClean Deep Cleaning",        type: "home",     subtype: "Cleaning",          area: "Neopolis All Blocks",        phone: "+91 90003 30003", availability: "Mon – Sun, 6 AM – 7 PM",  rating: 4.9, priceHint: "From ₹1,299",  tags: ["Sofa Clean", "Kitchen Deep", "Bathroom Scrub"]                  },
  { name: "PestFree Solutions",              type: "home",     subtype: "Pest Control",      area: "Neopolis & Kokapet",         phone: "+91 90003 30004", availability: "Mon – Sat, 9 AM – 5 PM",  rating: 4.6, priceHint: "From ₹599",    tags: ["Cockroach", "Bed Bugs", "Termite", "Rodent Control"]            },
  { name: "AquaFix Plumbing",                type: "home",     subtype: "Plumbing",          area: "Neopolis Towers",            phone: "+91 90003 30005", availability: "24 / 7 Emergency",        rating: 4.7, priceHint: "From ₹349",    tags: ["Leakage Fix", "Tap & Flush", "Pipeline", "Water Heater"]        },
  { name: "HomeGuru Maintenance",            type: "home",     subtype: "AMC & Maintenance", area: "Neopolis & Kokapet",         phone: "+91 90003 30006", availability: "Mon – Sat, 8 AM – 6 PM",  rating: 4.5, priceHint: "From ₹999/mo", tags: ["Annual Contract", "Electrician", "Plumber On Call"]             },

  // ── Delivery ──────────────────────────────────────────────────────────────
  { name: "NeoDelivery Express",             type: "delivery", subtype: "Local Courier",     area: "Within Neopolis",            phone: "+91 90003 40001", availability: "Mon – Sun, 8 AM – 10 PM", rating: 4.7, priceHint: "From ₹49",     tags: ["Same Hour Delivery", "Documents", "Parcels"]                    },
  { name: "FreshBox Daily Groceries",        type: "delivery", subtype: "Grocery Delivery",  area: "Neopolis All Towers",        phone: "+91 90003 40002", availability: "Daily, 7 AM – 9 AM",      rating: 4.8, priceHint: "Free above ₹499",tags: ["Fruits & Veg", "Dairy", "Morning Delivery"]                     },
  { name: "QuickCart Grocery",               type: "delivery", subtype: "Grocery Delivery",  area: "Neopolis & Kokapet",         phone: "+91 90003 40003", availability: "Daily, 9 AM – 9 PM",      rating: 4.6, priceHint: "From ₹29",     tags: ["30-Min Delivery", "Staples", "Packaged Food"]                   },
  { name: "MediDeliver Pharmacy",            type: "delivery", subtype: "Medicine Delivery", area: "Neopolis & Kokapet",         phone: "+91 90003 40004", availability: "24 / 7",                  rating: 4.9, priceHint: "Free delivery",  tags: ["Prescription Medicines", "OTC", "Urgent Delivery"]             },
  { name: "WashNFold Laundry Pickup",        type: "delivery", subtype: "Laundry",           area: "Neopolis All Blocks",        phone: "+91 90003 40005", availability: "Mon – Sat, 8 AM – 7 PM",  rating: 4.7, priceHint: "From ₹79/kg",   tags: ["Wash & Fold", "Dry Clean", "Ironing", "48hr Turnaround"]       },
  { name: "SwiftParcel Courier",             type: "delivery", subtype: "Courier",           area: "Hyderabad & Outstation",     phone: "+91 90003 40006", availability: "Mon – Sat, 9 AM – 7 PM",  rating: 4.5, priceHint: "From ₹99",     tags: ["Door Pickup", "Next-Day Delivery", "Fragile Handling"]          },

  // ── Driving ───────────────────────────────────────────────────────────────
  { name: "DriveEasy Chauffeur",             type: "driving",  subtype: "Chauffeur Service", area: "Neopolis & Hyderabad",       phone: "+91 90003 50001", availability: "24 / 7",                  rating: 4.9, priceHint: "From ₹4,000/mo",tags: ["Monthly Driver Hire", "Own Car", "Professional"]                },
  { name: "SafeRide Driver on Call",         type: "driving",  subtype: "On-Demand Driver",  area: "Neopolis & Kokapet",         phone: "+91 90003 50002", availability: "6 AM – 11 PM",            rating: 4.8, priceHint: "From ₹299/trip",tags: ["Drive Your Car", "Evening Out", "Outstation"]                   },
  { name: "NeoDriver Monthly",               type: "driving",  subtype: "Monthly Driver",    area: "Neopolis Residents",         phone: "+91 90003 50003", availability: "Mon – Sat, 8 AM – 6 PM",  rating: 4.7, priceHint: "From ₹9,000/mo",tags: ["Full-Time Driver", "Weekday Duty", "Verified & Trained"]        },
  { name: "SchoolDrop Driver",               type: "driving",  subtype: "School Cab",        area: "Neopolis & Kondapur",        phone: "+91 90003 50004", availability: "Mon – Fri, 7 AM – 4 PM",  rating: 4.9, priceHint: "From ₹3,500/mo",tags: ["School Pickup & Drop", "GPS Tracked", "Lady Driver Available"]  },
  { name: "AirportRide Transfer",            type: "driving",  subtype: "Airport Transfer",  area: "Neopolis to RGIA",           phone: "+91 90003 50005", availability: "24 / 7",                  rating: 4.8, priceHint: "From ₹899",    tags: ["Sedan & SUV", "Fixed Price", "Meet & Greet"]                    },
  { name: "OutStation Cabs",                 type: "driving",  subtype: "Outstation Cab",    area: "Hyderabad & Beyond",         phone: "+91 90003 50006", availability: "24 / 7 Booking",          rating: 4.6, priceHint: "From ₹12/km",  tags: ["Roundtrip", "One-Way", "Tempo Traveller Available"]             },
];

const TAB_MAP = Object.fromEntries(TABS.map((t) => [t.id, t]));

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

function ProviderCard({ p }: { p: Provider }) {
  const tab = TAB_MAP[p.type];
  const Icon = tab.icon;
  return (
    <div className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tab.color} border-current/20`}>
          <Icon className="w-5 h-5" />
        </div>
        <StarRating rating={p.rating} />
      </div>

      <div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tab.color} border-current/30`}>
          {p.subtype}
        </span>
        <h3 className="font-bold text-gray-900 text-sm mt-2 leading-snug">{p.name}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 shrink-0" /> {p.area}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {p.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-gray-500">
          <Clock className="w-3.5 h-3.5 text-gray-400" /> {p.availability}
        </span>
        <span className="flex items-center gap-1 font-semibold text-gray-700">
          <IndianRupee className="w-3 h-3" />{p.priceHint.replace("₹", "").replace("From ", "")}
        </span>
      </div>

      <a
        href={`tel:${p.phone.replace(/\s/g, "")}`}
        className={`flex items-center justify-center gap-2 w-full border border-gray-200 hover:${tab.accent} text-gray-600 text-xs font-semibold py-2 rounded-lg transition-colors`}
      >
        <Phone className="w-3.5 h-3.5" /> {p.phone}
      </a>
    </div>
  );
}

export default function LocalServicesPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as ServiceType | null;
  const VALID: ServiceType[] = ["moving", "party", "home", "delivery", "driving"];

  const [active, setActive] = useState<ServiceType>(
    typeParam && VALID.includes(typeParam) ? typeParam : "moving"
  );

  useEffect(() => {
    const t = searchParams.get("type") as ServiceType | null;
    if (t && VALID.includes(t)) setActive(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const tab = TAB_MAP[active];
  const filtered = PROVIDERS.filter((p) => p.type === active);

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-700 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-gray-700 border border-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" /> Local Services
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Neopolis{" "}
              <span className="text-brand-400">Local Services</span>
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Moving, party planning, home maintenance, delivery and driving
              services — all available within and around the Neopolis district.
            </p>
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`inline-flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    active === t.id
                      ? "bg-white text-gray-900 font-bold"
                      : "bg-gray-700 border border-gray-500 text-gray-200 hover:bg-gray-600"
                  }`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Tabs ── */}
      <section className="bg-white border-b border-gray-100 sticky top-[calc(4rem+28px)] z-30">
        <SectionWrapper tight>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {TABS.map((t) => {
              const isActive = active === t.id;
              const count = PROVIDERS.filter((p) => p.type === t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Grid ── */}
      <section className="bg-gray-50">
        <SectionWrapper>
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tab.color}`}>
                <tab.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="section-heading !mb-0">{tab.label} Services</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filtered.length} providers in Neopolis
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <ProviderCard key={p.name} p={p} />
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Register CTA ── */}
      <section className="bg-gray-900 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                List Your Service Business
              </h2>
              <p className="text-gray-400 mb-5">
                Get found by Neopolis residents who need moving, home, party,
                delivery, and driving services.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                {[
                  "Appear in category search",
                  "Phone & availability shown",
                  "Pricing hint attracts enquiries",
                  "Reach 12,000+ district residents",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 mt-6 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <LeadForm
                title="List Your Service"
                subtitle="Tell us what service you offer and your area of operation."
                purpose="services-directory"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}

// Need Wrench for the hero badge
function Wrench({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
