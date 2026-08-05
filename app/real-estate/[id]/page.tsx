import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2, MapPin, ArrowLeft, ExternalLink,
  Tag, ChevronRight, CheckCircle, Download,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { toProject, type Project, type UnitPlan } from "@/lib/projectsStore";
import { toAnnouncement, type Announcement } from "@/lib/announcementsStore";
import { AMENITY_CATEGORIES, AMENITY_ICONS } from "@/lib/amenitiesData";
import SectionWrapper from "@/components/SectionWrapper";
import ProjectEnquiryForm from "./ProjectEnquiryForm";
import SiteVisitForm from "./SiteVisitForm";
import ProjectSubscribeBox from "./ProjectSubscribeBox";
import LifecycleTimeline from "./LifecycleTimeline";
import MasterPlanModal from "./MasterPlanModal";
import BrochureDownload from "./BrochureDownload";
import WhatsAppShare from "@/components/WhatsAppShare";
import SaveButton from "@/components/SaveButton";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const PROJECT_SELECT = `
  *, builders(builder_name),
  contacts(id, email, website, project_owner, facebook_url, instagram_url, youtube_url,
    contact_phones(id, phone_number, role, sort_order)
  ),
  project_details(id, num_towers, max_floors, amenities_sqft,
    towers(id, tower_name, num_floors, sort_order,
      tower_unit_plans(id, project_id, unit_plan_id, floor_from, floor_to, units_per_floor, sort_order)
    )
  ),
  unit_plans(id, plan_name, bhk, maid_room, home_office, size_sqft, facing, plan_url, sort_order)
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatInr(val: number) {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (val >= 100_000)    return `₹${(val / 100_000).toFixed(1)} L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("projects")
    .select("project_name, builders(builder_name), tier, project_type, total_units, price_range_min, price_range_max")
    .eq("id", params.id)
    .single();

  if (!data) return { title: "Project Not Found — NeopolisNews" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builderRow = Array.isArray((data as any).builders)
    ? (data as any).builders[0]
    : (data as any).builders;
  const builderName: string | null = builderRow?.builder_name ?? null;
  const tier  = TIER_LABELS[(data as any).tier ?? ""] ?? "";
  const pType = TYPE_LABELS[(data as any).project_type ?? ""] ?? "Apartments";

  const title = `${data.project_name}${builderName ? ` by ${builderName}` : ""} — ${tier ? `${tier} ` : ""}${pType} in Neopolis, Hyderabad | NeopolisNews`;

  const description = [
    `${data.project_name} is a${tier ? ` ${tier.toLowerCase()}` : ""} ${pType.toLowerCase()} project`,
    builderName ? `by ${builderName}` : null,
    "in the Neopolis district, Hyderabad, Telangana.",
    (data as any).total_units ? `${(data as any).total_units} total units.` : null,
  ].filter(Boolean).join(" ");

  return {
    title,
    description,
    openGraph: {
      title: `${data.project_name}${builderName ? ` by ${builderName}` : ""} | Neopolis`,
      description,
      url: `${SITE_URL}/real-estate/${params.id}`,
      siteName: "NeopolisNews",
      type: "website",
    },
    alternates: { canonical: `${SITE_URL}/real-estate/${params.id}` },
  };
}

// ─── Announcement Card ────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: projectData }, { data: annData }, { data: updateData }] = await Promise.all([
    admin.from("projects").select(PROJECT_SELECT).eq("id", params.id).single(),
    admin
      .from("availability_announcements")
      .select("*, unit_plans(plan_name, bhk, maid_room, home_office, size_sqft, facing), towers(tower_name)")
      .eq("project_id", params.id)
      .eq("status", "active")
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order("created_at", { ascending: false }),
    admin
      .from("articles")
      .select("id, title, excerpt, image_url, date, read_time")
      .eq("project_id", params.id)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  if (!projectData) notFound();

  const project: Project = toProject(projectData);
  const announcements: Announcement[] = (annData ?? []).map(toAnnouncement);
  const constructionUpdates = updateData ?? [];

  const towers    = project.projectDetail?.towers ?? [];
  const unitPlans = project.unitPlans ?? [];

  const priceLabel = project.priceRangeMin && project.priceRangeMax
    ? `₹${project.priceRangeMin.toLocaleString("en-IN")} – ₹${project.priceRangeMax.toLocaleString("en-IN")} /sft`
    : project.priceRangeMin
    ? `From ₹${project.priceRangeMin.toLocaleString("en-IN")} /sft`
    : null;

  const cheapestPlan = unitPlans.reduce<number | null>((min, u: UnitPlan) => {
    if (!project.priceRangeMin) return min;
    const total = project.priceRangeMin * u.sizeSqft;
    return min === null || total < min ? total : min;
  }, null);
  const pricestPlan = unitPlans.reduce<number | null>((max, u: UnitPlan) => {
    if (!project.priceRangeMax) return max;
    const total = project.priceRangeMax * u.sizeSqft;
    return max === null || total > max ? total : max;
  }, null);

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.projectName,
    description: [
      project.projectName,
      project.builderName ? `by ${project.builderName}` : null,
      project.tier ? `— ${TIER_LABELS[project.tier]} project` : null,
      "in Neopolis district, Hyderabad, Telangana, India.",
    ].filter(Boolean).join(" "),
    url: `${SITE_URL}/real-estate/${project.id}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Neopolis, Hyderabad",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
    ...(project.contact?.email ? { email: project.contact.email } : {}),
    ...(project.contact?.phones?.length
      ? { telephone: project.contact.phones[0].phoneNumber }
      : {}),
    ...(project.contact?.website ? { url: project.contact.website } : {}),
    ...(project.totalUnits ? { numberOfRooms: project.totalUnits } : {}),
    ...(project.priceRangeMin
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: project.priceRangeMin,
            ...(project.priceRangeMax ? { highPrice: project.priceRangeMax } : {}),
          },
        }
      : {}),
    ...(project.builderName
      ? { seller: { "@type": "Organization", name: project.builderName } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white py-10 md:py-14">
        <SectionWrapper tight>
          <Link href="/real-estate"
            className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Projects
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-24 h-24 rounded-2xl border border-brand-700 bg-brand-800 flex items-center justify-center shrink-0 overflow-hidden p-1">
              {project.projectLogoUrl
                ? <img src={project.projectLogoUrl} alt={project.projectName} className="w-full h-full object-contain" />
                : <Building2 className="w-10 h-10 text-brand-500" />
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
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <WhatsAppShare
                  title={`Check out ${project.projectName}${project.builderName ? ` by ${project.builderName}` : ""} in Neopolis, Hyderabad 🏗️`}
                  size="sm"
                />
                <SaveButton itemType="project" itemId={project.id!} size="sm" />
              </div>
            </div>
          </div>

          {/* ── Lifecycle Timeline ── */}
          {project.lifecycleStatus && (
            <div className="mt-8 pt-6 border-t border-brand-700/60">
              <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-5">Project Status</p>
              <LifecycleTimeline current={project.lifecycleStatus} dark />
            </div>
          )}
        </SectionWrapper>
      </section>

      {/* ── Banner ── */}
      {project.bannerImageUrl && (
        <div className="w-full overflow-hidden" style={{ maxHeight: "520px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.bannerImageUrl}
            alt={`${project.projectName} — Project View`}
            className="w-full object-cover object-center"
            style={{ maxHeight: "520px" }}
          />
        </div>
      )}

      {/* ── Key Stats ── */}
      <SectionWrapper tight>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 -mt-6">
          {[
            { label: "Total Units",   value: project.totalUnits?.toLocaleString("en-IN") },
            { label: "Land Area",     value: project.totalLandAreaAcres ? `${project.totalLandAreaAcres} acres` : null },
            { label: "Max Floors",    value: project.projectDetail?.maxFloors ? `${project.projectDetail.maxFloors} floors` : null },
            { label: "Clubhouse",     value: project.projectDetail?.amenitiesSqft
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
                      const plan = unitPlans.find((u: UnitPlan) => u.id === fp.unitPlanId);
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
              {unitPlans.map((u: UnitPlan) => (
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

      {/* ── Master Plan + Brochure ── */}
      {(project.projectPlanUrl || project.brochureUrl) && (
        <SectionWrapper tight>
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Downloads</h2>
          <div className="space-y-3">
            {project.projectPlanUrl && (
              <MasterPlanModal url={project.projectPlanUrl} />
            )}
            {project.brochureUrl && (
              <BrochureDownload url={project.brochureUrl} />
            )}
          </div>
        </SectionWrapper>
      )}

      {/* ── Construction Updates ── */}
      {constructionUpdates.length > 0 && (
        <section className="bg-orange-50 border-y border-orange-100">
          <SectionWrapper tight>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                Construction Updates
              </h2>
              <Link
                href="/real-estate/construction-updates"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                All updates <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {constructionUpdates.map((u) => (
                <Link
                  key={u.id}
                  href={`/news/${u.id}`}
                  className="bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {u.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.image_url} alt={u.title} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 mb-2">
                      {u.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-3">{u.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                      <span>{u.date}</span>
                      <span>{u.read_time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SectionWrapper>
        </section>
      )}

      {/* ── Amenities ── */}
      {project.amenities && project.amenities.length > 0 && (
        <section className="bg-gray-50 border-y border-gray-100">
          <SectionWrapper tight>
            <h2 className="text-lg font-extrabold text-gray-900 mb-6">
              Amenities
              <span className="ml-2 text-sm font-normal text-gray-400">
                {project.amenities.length} features
              </span>
            </h2>
            <div className="space-y-6">
              {AMENITY_CATEGORIES.map((cat) => {
                const present = cat.items.filter(item => project.amenities.includes(item));
                if (present.length === 0) return null;
                return (
                  <div key={cat.category}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      {cat.category}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {present.map(item => {
                        const Icon = AMENITY_ICONS[item];
                        return (
                          <div key={item} className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2 shadow-sm">
                            {Icon
                              ? <Icon className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                              : <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            }
                            <span className="text-xs font-medium text-gray-700">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>
        </section>
      )}

      {/* ── Site visit + Enquiry ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper tight>
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
            <SiteVisitForm projectId={project.id!} projectName={project.projectName} />
            <ProjectEnquiryForm projectId={project.id} projectName={project.projectName} />
          </div>
          <div className="max-w-4xl mx-auto mt-8">
            <ProjectSubscribeBox projectId={project.id!} projectName={project.projectName} />
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
