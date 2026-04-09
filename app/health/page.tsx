import Link from "next/link";
import {
  Hospital,
  Ambulance,
  Stethoscope,
  Pill,
  Phone,
  PhoneCall,
  Clock,
  CheckCircle,
  ArrowRight,
  MapPin,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Health Directory – NeopolisNews",
  description:
    "Hospitals, clinics, pharmacies, and ambulance services in the Neopolis district — with emergency numbers, hours, and locations.",
};

const EMERGENCY_CONTACTS = [
  {
    type: "Hospital",
    name: "Neopolis General Hospital",
    location: "Block A, Healthcare Zone",
    emergency: "+91 99001 00001",
    phone: "+91 99001 00002",
    hours: "24 / 7",
    beds: 320,
    specialities: ["Trauma & Emergency", "Cardiology", "Orthopaedics", "ICU"],
  },
  {
    type: "Hospital",
    name: "Apex Multi-Speciality Hospital",
    location: "Tower 3, Neopolis Health Hub",
    emergency: "+91 99001 00011",
    phone: "+91 99001 00012",
    hours: "24 / 7",
    beds: 180,
    specialities: ["Neurology", "Oncology", "Paediatrics", "Maternity"],
  },
  {
    type: "Ambulance",
    name: "Neopolis Rapid Ambulance",
    location: "District Central Station",
    emergency: "+91 99001 00021",
    phone: "+91 99001 00022",
    hours: "24 / 7",
    fleet: "12 ALS-equipped vehicles",
    specialities: ["Advanced Life Support", "ICU Transport", "Neonatal Transfer"],
  },
  {
    type: "Ambulance",
    name: "Swift Medics Private Ambulance",
    location: "Gate 2, Neopolis South",
    emergency: "+91 99001 00031",
    phone: "+91 99001 00032",
    hours: "24 / 7",
    fleet: "6 BLS vehicles",
    specialities: ["Basic Life Support", "Non-Emergency Transport", "Event Medical Cover"],
  },
];

const CLINICS = [
  {
    name: "Neopolis Family Clinic",
    location: "Ground Floor, Residential Block C",
    phone: "+91 99001 00041",
    hours: "8:00 AM – 9:00 PM",
    days: "Mon – Sat",
    speciality: "General Practice",
  },
  {
    name: "Smile Dental Studio",
    location: "Level 1, Commercial Block B",
    phone: "+91 99001 00051",
    hours: "10:00 AM – 7:00 PM",
    days: "Mon – Sat",
    speciality: "Dental",
  },
  {
    name: "VisionCare Eye Centre",
    location: "Block D, Health Strip",
    phone: "+91 99001 00061",
    hours: "9:00 AM – 6:00 PM",
    days: "Mon – Sun",
    speciality: "Ophthalmology",
  },
  {
    name: "PhysioPlus Rehabilitation",
    location: "Podium Level, Tower 2",
    phone: "+91 99001 00071",
    hours: "7:00 AM – 8:00 PM",
    days: "Mon – Sat",
    speciality: "Physiotherapy",
  },
];

const PHARMACIES = [
  {
    name: "MedPlus – Neopolis Central",
    location: "Ground Floor, Grand Mall",
    phone: "+91 99001 00081",
    hours: "8:00 AM – 11:00 PM",
    days: "Mon – Sun",
    open24: false,
  },
  {
    name: "Apollo Pharmacy – Block A",
    location: "Healthcare Zone, Block A",
    phone: "+91 99001 00091",
    hours: "24 hours",
    days: "All days",
    open24: true,
  },
  {
    name: "Wellness Pharmacy",
    location: "Residential Block C, Shop 4",
    phone: "+91 99001 00101",
    hours: "9:00 AM – 10:00 PM",
    days: "Mon – Sun",
    open24: false,
  },
];

export default function HealthPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-red-700 to-red-500 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-red-600 border border-red-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              <PhoneCall className="w-3.5 h-3.5" /> Health &amp; Emergency Services
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Neopolis{" "}
              <span className="text-red-200">Health Directory</span>
            </h1>
            <p className="text-red-100 text-lg mb-6">
              Hospitals, ambulance services, clinics, and pharmacies in the
              district — emergency numbers always one tap away.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#emergency"
                className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors"
              >
                <PhoneCall className="w-4 h-4" /> Emergency Numbers
              </a>
              <a
                href="#pharmacies"
                className="inline-flex items-center gap-2 bg-red-600 border border-red-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-red-500 transition-colors"
              >
                <Pill className="w-4 h-4" /> Find a Pharmacy
              </a>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Quick category links ── */}
      <section className="bg-white border-b border-gray-100">
        <SectionWrapper tight>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: "#hospitals",  Icon: Hospital,    label: "Hospitals",           color: "bg-red-50 text-red-600"    },
              { href: "#ambulance",  Icon: Ambulance,   label: "Ambulance",           color: "bg-orange-50 text-orange-600" },
              { href: "#clinics",    Icon: Stethoscope, label: "Clinics",             color: "bg-cyan-50 text-cyan-600"  },
              { href: "#pharmacies", Icon: Pill,        label: "Pharmacies",          color: "bg-teal-50 text-teal-600"  },
            ].map(({ href, Icon, label, color }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-sm transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-red-400 transition-colors" />
              </a>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Emergency Contacts ── */}
      <section id="emergency" className="bg-red-50 border-b border-red-100">
        <SectionWrapper tight>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Emergency &amp; 24 / 7 Contacts</h2>
              <p className="text-sm text-gray-500">Hospitals and ambulance services always on call</p>
            </div>
          </div>

          <div id="hospitals" className="space-y-4 mb-8">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
              <Hospital className="w-4 h-4" /> Hospitals
            </h3>
            {EMERGENCY_CONTACTS.filter((c) => c.type === "Hospital").map((c) => (
              <div key={c.name} className="bg-white rounded-2xl border border-red-100 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Hospital className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900">{c.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {c.location}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {"specialities" in c && (c.specialities as string[]).map((s) => (
                      <span key={s} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={`tel:${c.emergency.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" /> Emergency: {c.emergency}
                  </a>
                  <a
                    href={`tel:${c.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm px-4 py-2 rounded-xl transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Reception: {c.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div id="ambulance" className="space-y-4">
            <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
              <Ambulance className="w-4 h-4" /> Ambulance Services
            </h3>
            {EMERGENCY_CONTACTS.filter((c) => c.type === "Ambulance").map((c) => (
              <div key={c.name} className="bg-white rounded-2xl border border-orange-100 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Ambulance className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900">{c.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {c.location}
                  </p>
                  {"fleet" in c && (
                    <p className="text-xs text-orange-700 font-semibold mt-1">{c.fleet as string}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {"specialities" in c && (c.specialities as string[]).map((s) => (
                      <span key={s} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={`tel:${c.emergency.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" /> Call Now: {c.emergency}
                  </a>
                  <a
                    href={`tel:${c.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm px-4 py-2 rounded-xl transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Office: {c.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Clinics ── */}
      <section id="clinics" className="bg-white">
        <SectionWrapper>
          <h2 className="section-heading mb-2">Clinics &amp; Specialists</h2>
          <p className="text-gray-500 text-sm mb-8">{CLINICS.length} clinics listed in Neopolis</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CLINICS.map((c) => (
              <div key={c.name} className="card p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">{c.speciality}</span>
                  <h3 className="font-bold text-gray-900 text-sm mt-2">{c.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {c.location}
                  </p>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {c.hours} · {c.days}
                  </p>
                </div>
                <a
                  href={`tel:${c.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-cyan-400 hover:text-cyan-700 text-gray-600 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> {c.phone}
                </a>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Pharmacies ── */}
      <section id="pharmacies" className="bg-gray-50">
        <SectionWrapper>
          <h2 className="section-heading mb-2">Pharmacies</h2>
          <p className="text-gray-500 text-sm mb-8">{PHARMACIES.length} pharmacies in Neopolis</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PHARMACIES.map((p) => (
              <div key={p.name} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-teal-600" />
                  </div>
                  {p.open24 && (
                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      24 / 7
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {p.location}
                  </p>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {p.hours} · {p.days}
                </p>
                <a
                  href={`tel:${p.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-teal-400 hover:text-teal-700 text-gray-600 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> {p.phone}
                </a>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Register CTA ── */}
      <section className="bg-red-700 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Register Your Health Business
              </h2>
              <p className="text-red-200 mb-5">
                Get listed in the Neopolis Health Directory. Residents search
                for hospitals, clinics, and pharmacies here first.
              </p>
              <ul className="space-y-2 text-sm text-red-100">
                {[
                  "Emergency number shown prominently",
                  "Business hours & location visible",
                  "Searchable by speciality",
                  "Reach 12,000+ district residents",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-red-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 mt-6 bg-white text-red-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-50 transition-colors"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-red-800 rounded-2xl border border-red-600 p-6">
              <LeadForm
                title="List Your Health Service"
                subtitle="We'll set up your profile with emergency numbers and hours."
                purpose="health-directory"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
