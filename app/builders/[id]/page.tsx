import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2, MapPin, Globe, Phone, ArrowLeft, Layers, HardHat, ChevronRight,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import SectionWrapper from "@/components/SectionWrapper";
import SaveButton from "@/components/SaveButton";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const TIER_LABELS: Record<string, string> = {
  affordable: "Affordable", premium: "Premium", luxury: "Luxury", uber_luxury: "Uber Luxury",
};
const LIFECYCLE_LABELS: Record<string, string> = {
  pre_launch: "Pre-Launch", rera_registered: "RERA Registered",
  under_construction: "Under Construction", structure_complete: "Structure Complete",
  finishing: "Finishing", oc_received: "OC Received", ready_to_move: "Ready to Move",
};

interface BuilderRow {
  id: string;
  builder_name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
}

interface ProjectRow {
  id: string;
  project_name: string;
  project_type: string | null;
  tier: string | null;
  lifecycle_status: string | null;
  total_units: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  project_logo_url: string | null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("builders")
    .select("builder_name")
    .eq("id", params.id)
    .single();
  if (!data) return { title: "Builder — NeopolisNews" };
  return {
    title: `${data.builder_name} — Projects in Neopolis | NeopolisNews`,
    description: `All ${data.builder_name} projects in the Neopolis district: launches, construction progress and prices.`,
  };
}

export default async function BuilderPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const { data: builder } = await admin
    .from("builders")
    .select("id, builder_name, logo_url, address, phone, website")
    .eq("id", params.id)
    .single<BuilderRow>();

  if (!builder) notFound();

  const [{ data: projects }, { data: updates }] = await Promise.all([
    admin
      .from("projects")
      .select("id, project_name, project_type, tier, lifecycle_status, total_units, price_range_min, price_range_max, project_logo_url")
      .eq("builder_id", builder.id)
      .order("created_at", { ascending: false }),
    admin
      .from("articles")
      .select("id, title, tag, tag_color, date, read_time")
      .eq("builder_id", builder.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const projectList = (projects ?? []) as ProjectRow[];

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white py-10 md:py-14">
        <SectionWrapper tight>
          <Link
            href="/real-estate"
            className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Projects
          </Link>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0">
              {builder.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={builder.logo_url} alt={builder.builder_name} className="w-full h-full object-contain" />
              ) : (
                <HardHat className="w-9 h-9 text-brand-400" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl md:text-3xl font-extrabold">{builder.builder_name}</h1>
                <SaveButton itemType="builder" itemId={builder.id} variant="dark" />
              </div>
              <p className="text-brand-300 text-sm mt-1">
                {projectList.length} project{projectList.length !== 1 ? "s" : ""} in Neopolis
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-brand-200 justify-center sm:justify-start">
                {builder.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {builder.address}
                  </span>
                )}
                {builder.phone && (
                  <a href={`tel:${builder.phone}`} className="flex items-center gap-1.5 hover:text-white">
                    <Phone className="w-4 h-4" /> {builder.phone}
                  </a>
                )}
                {builder.website && (
                  <a
                    href={builder.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Projects ── */}
      <SectionWrapper>
        <h2 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-500" /> Projects by {builder.builder_name}
        </h2>
        {projectList.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No projects listed yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projectList.map((p) => (
              <Link
                key={p.id}
                href={`/real-estate/${p.id}`}
                className="card p-5 hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {p.project_logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.project_logo_url} alt={p.project_name} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-brand-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-brand-700 truncate">
                      {p.project_name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {[TIER_LABELS[p.tier ?? ""], p.total_units ? `${p.total_units.toLocaleString()} units` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {p.lifecycle_status ? (
                    <span className="badge text-xs tag-orange">
                      {LIFECYCLE_LABELS[p.lifecycle_status] ?? p.lifecycle_status}
                    </span>
                  ) : <span />}
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* ── Latest updates ── */}
      {(updates ?? []).length > 0 && (
        <section className="bg-gray-50">
          <SectionWrapper tight>
            <h2 className="text-lg font-extrabold text-gray-900 mb-5">
              Latest from {builder.builder_name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(updates ?? []).map((a) => (
                <Link key={a.id} href={`/news/${a.id}`} className="card p-4 group">
                  <span className={`${a.tag_color} text-xs`}>{a.tag}</span>
                  <h3 className="font-semibold text-sm text-gray-900 mt-2 group-hover:text-brand-700 leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2">
                    {a.date} · {a.read_time} read
                  </p>
                </Link>
              ))}
            </div>
          </SectionWrapper>
        </section>
      )}
    </>
  );
}
