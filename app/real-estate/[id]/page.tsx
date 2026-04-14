"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2, MapPin, ArrowLeft, ExternalLink,
  Tag, FileText, ChevronRight, CheckCircle,
} from "lucide-react";
import { getProjectById, type Project } from "@/lib/projectsStore";
import { getActiveAnnouncementsByProject, type Announcement } from "@/lib/announcementsStore";
import SectionWrapper from "@/components/SectionWrapper";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  affordable:  "Affordable",
  premium:     "Premium",
  luxury:      "Luxury",
  uber_luxury: "Uber Luxury",
};

const TYPE_LABELS: Record<string, string> = {
  apartments:        "Apartments",
  independent_homes: "Independent Homes",
  residential:       "Residential",
  mixed_use:         "Mixed Use",
  commercial:        "Commercial",
};

const TIER_COLORS: Record<string, string> = {
  affordable:  "bg-blue-50 text-blue-700",
  premium:     "bg-purple-50 text-purple-700",
  luxury:      "bg-amber-50 text-amber-700",
  uber_luxury: "bg-rose-50 text-rose-800",
};

function formatInr(val: number) {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (val >= 100_000)    return `₹${(val / 100_000).toFixed(1)} L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject]             = useState<Project | null | undefined>(undefined);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProjectById(id),
      getActiveAnnouncementsByProject(id),
    ]).then(([proj, anns]) => {
      setProject(proj);
      setAnnouncements(anns);
      setLoading(false);
    });
  }, [id]);

  if (loading || project === undefined) {
    return (
      <SectionWrapper>
        <div className="py-24 text-center text-gray-400 text-sm">Loading project…</div>
      </SectionWrapper>
    );
  }

  if (!project) {
    return (
      <SectionWrapper>
        <div className="py-24 text-center">
          <p className="text-gray-500 font-medium">Project not found.</p>
          <Link href="/real-estate" className="text-brand-600 text-sm mt-2 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
          </Link>
        </div>
      </SectionWrapper>
    );
  }

  const towers    = project.projectDetail?.towers ?? [];
  const unitPlans = project.unitPlans ?? [];

  const priceLabel = project.priceRangeMin && project.priceRangeMax
    ? `₹${project.priceRangeMin.toLocaleString("en-IN")} – ₹${project.priceRangeMax.toLocaleString("en-IN")} /sft`
    : project.priceRangeMin
    ? `From ₹${project.priceRangeMin.toLocaleString("en-IN")} /sft`
    : null;

  // Rough total price range from unit plans + price range
  const cheapestPlan = unitPlans.reduce<number | null>((min, u) => {
    if (!project.priceRangeMin) return min;
    const total = project.priceRangeMin * u.sizeSqft;
    return min === null || total < min ? total : min;
  }, null);
  const pricestPlan = unitPlans.reduce<number | null>((max, u) => {
    if (!project.priceRangeMax) return max;
    const total = project.priceRangeMax * u.sizeSqft;
    return max === null || total > max ? total : max;
  }, null);

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white py-10 md:py-14">
        <SectionWrapper tight>
          <Link href="/real-estate"
            className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Projects
          </Link>
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl border border-brand-700 bg-brand-800 flex items-center justify-center shrink-0 overflow-hidden">
              {project.projectLogoUrl
                ? <img src={project.projectLogoUrl} alt={project.projectName} className="w-full h-full object-cover" />
                : <Building2 className="w-8 h-8 text-brand-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {project.tier && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TIER_COLORS[project.tier] ?? "bg-gray-100 text-gray-600"}`}>
                    {TIER_LABELS[project.tier] ?? project.tier}
                  </span>
                )}
                {project.projectType && (
                  <span className="text-xs text-brand-300">{TYPE_LABELS[project.projectType] ?? project.projectType}</span>
                )}
                {project.coreNeopolis && (
                  <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Core Neopolis
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{project.projectName}</h1>
              {project.builderName && (
                <p className="text-brand-300 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> By {project.builderName}
                </p>
              )}
              {priceLabel && (
                <p className="text-2xl font-black text-brand-200 mt-3">{priceLabel}</p>
              )}
              {cheapestPlan && pricestPlan && (
                <p className="text-sm text-brand-300 mt-0.5">
                  Total approx. {formatInr(cheapestPlan)} – {formatInr(pricestPlan)}
                </p>
              )}
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Key Stats ── */}
      <SectionWrapper tight>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 -mt-6">
          {[
            { label: "Total Units",   value: project.totalUnits?.toLocaleString("en-IN") },
            { label: "Land Area",     value: project.totalLandAreaAcres ? `${project.totalLandAreaAcres} acres` : null },
            { label: "Max Floors",    value: project.projectDetail?.maxFloors ? `${project.projectDetail.maxFloors}G` : null },
            { label: "Amenities",     value: project.projectDetail?.amenitiesSqft
                ? `${(project.projectDetail.amenitiesSqft / 1000).toFixed(0)}k sft` : null },
          ].filter(s => s.value).map(s => (
            <div key={s.label} className="card p-4 text-center shadow-md">
              <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Availability Announcements ── */}
      {announcements.length > 0 && (
        <section className="bg-green-50 border-y border-green-100">
          <SectionWrapper tight>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                Available Now
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {announcements.length} unit{announcements.length !== 1 ? "s" : ""} currently open for booking
              </p>
            </div>
            <div className="space-y-3">
              {announcements.map(ann => (
                <AnnouncementCard key={ann.id} ann={ann} />
              ))}
            </div>
          </SectionWrapper>
        </section>
      )}

      {/* ── Towers & Floor Plans ── */}
      {towers.length > 0 && (
        <SectionWrapper tight>
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Towers &amp; Floor Plans</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {towers.map(t => (
              <div key={t.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.towerName}</p>
                    <p className="text-xs text-gray-400">{t.numFloors} floors</p>
                  </div>
                </div>
                {t.floorPlans && t.floorPlans.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 space-y-2.5">
                    {t.floorPlans.map((fp, i) => {
                      const plan = unitPlans.find(u => u.id === fp.unitPlanId);
                      if (!plan) return null;
                      return (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center font-black text-brand-700 text-base shrink-0">
                              {plan.bhk}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{plan.planName}</p>
                              <p className="text-xs text-gray-400">
                                {plan.sizeSqft.toLocaleString()} sft{plan.facing ? ` · ${plan.facing}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500 shrink-0">
                            {(fp.floorFrom || fp.floorTo) && (
                              <p className="font-medium">
                                Fl {fp.floorFrom ?? "–"}{fp.floorTo && fp.floorTo !== fp.floorFrom ? `–${fp.floorTo}` : ""}
                              </p>
                            )}
                            {fp.unitsPerFloor > 1 && (
                              <p>{fp.unitsPerFloor} units/floor</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ── Unit Plans ── */}
      {unitPlans.length > 0 && (
        <section className="bg-gray-50">
          <SectionWrapper tight>
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">Unit Plans</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {unitPlans.map(u => (
                <div key={u.id} className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 font-black text-brand-700 text-lg">
                    {u.bhk}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{u.planName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {u.bhk} BHK{u.maidRoom ? " + Maid" : ""}{u.homeOffice ? " + Home Office" : ""}
                      {" · "}{u.sizeSqft.toLocaleString("en-IN")} sft
                      {u.facing ? ` · ${u.facing}` : ""}
                    </p>
                    {priceLabel && project.priceRangeMin && project.priceRangeMax && (
                      <p className="text-xs text-brand-700 font-semibold mt-1">
                        {formatInr(project.priceRangeMin * u.sizeSqft)} – {formatInr(project.priceRangeMax * u.sizeSqft)}
                      </p>
                    )}
                  </div>
                  {u.planUrl && (
                    <a href={u.planUrl} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors shrink-0"
                      title="View floor plan">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </SectionWrapper>
        </section>
      )}

      {/* ── Project Layout Plan ── */}
      {project.projectPlanUrl && (
        <SectionWrapper tight>
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Master Plan</h2>
          <a href={project.projectPlanUrl} target="_blank" rel="noopener noreferrer"
            className="card p-5 flex items-center gap-4 hover:border-brand-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                View Project Layout / Master Plan
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PDF or image · Opens in new tab</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors shrink-0" />
          </a>
        </SectionWrapper>
      )}

      {/* ── Contact ── */}
      {project.contact && (
        <section className="bg-brand-950 text-white">
          <SectionWrapper tight>
            <h2 className="text-lg font-extrabold mb-5">Contact & Enquiry</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                {project.contact.projectOwner && (
                  <p className="text-brand-200 text-sm">
                    <span className="text-brand-400 text-xs uppercase tracking-wide block">Project Owner</span>
                    {project.contact.projectOwner}
                  </p>
                )}
                {project.contact.phones.map((ph, i) => (
                  <div key={i}>
                    <span className="text-brand-400 text-xs uppercase tracking-wide">{ph.role.replace("_", " ")}</span>
                    <a href={`tel:${ph.phoneNumber}`}
                      className="block text-white font-semibold hover:text-brand-300 transition-colors">
                      {ph.phoneNumber}
                    </a>
                  </div>
                ))}
                {project.contact.email && (
                  <a href={`mailto:${project.contact.email}`}
                    className="block text-brand-300 hover:text-white text-sm transition-colors">
                    {project.contact.email}
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {project.contact.website && (
                  <a href={project.contact.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-300 hover:text-white text-sm transition-colors">
                    <ExternalLink className="w-4 h-4" /> Official Website
                  </a>
                )}
                {[
                  { url: project.contact.facebookUrl,  label: "Facebook"  },
                  { url: project.contact.instagramUrl, label: "Instagram" },
                  { url: project.contact.youtubeUrl,   label: "YouTube"   },
                ].filter(s => s.url).map(s => (
                  <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-300 hover:text-white text-sm transition-colors">
                    <ExternalLink className="w-4 h-4" /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </SectionWrapper>
        </section>
      )}
    </>
  );
}

// ─── Announcement Card (public view) ─────────────────────────────────────────

function AnnouncementCard({ ann }: { ann: Announcement }) {
  return (
    <div className="bg-white border border-green-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-start gap-3 justify-between mb-2">
        <div>
          <p className="font-bold text-gray-900 text-sm">
            {ann.unitPlanSummary ?? ann.unitPlanName ?? "Unit"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {ann.towerName ?? "Tower"}
            {(ann.floorFrom || ann.floorTo) && (
              <> · Floors {ann.floorFrom ?? "–"}{ann.floorTo && ann.floorTo !== ann.floorFrom ? ` – ${ann.floorTo}` : ""}</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-black">
          {ann.unitsAvailable != null && (
            <span className="text-green-700">{ann.unitsAvailable} available</span>
          )}
          {ann.pricePerSqft != null && (
            <span className="text-brand-700">₹{ann.pricePerSqft.toLocaleString("en-IN")}/sft</span>
          )}
        </div>
      </div>
      {ann.message && (
        <p className="text-sm text-gray-600 border-t border-gray-100 pt-2 mt-2">{ann.message}</p>
      )}
      {ann.validUntil && (
        <p className="text-xs text-gray-400 mt-2">
          Offer valid until{" "}
          {new Date(ann.validUntil + "T00:00:00").toLocaleDateString("en-IN", {
            day: "2-digit", month: "long", year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
