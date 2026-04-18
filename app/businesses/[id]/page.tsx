import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Building2,
  ArrowLeft,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Flag,
} from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayTiming {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

interface BusinessRow {
  id: string;
  name: string;
  industry: string;
  types: string[];
  subtypes: string[];
  address: string;
  status: string;
  verified: boolean;
  logo: string | null;
  pictures: string[];
  social_links: SocialLinks;
  contact_phone: string | null;
  description: string | null;
  timings: DayTiming[];
  completed_at: string | null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("businesses")
    .select("name, industry, description")
    .eq("id", params.id)
    .single();

  if (!data) return { title: "Business Not Found" };

  return {
    title: data.name,
    description: data.description ?? `${data.name} — ${data.industry} in Neopolis`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStatus(timings: DayTiming[]) {
  if (!timings?.length) return null;
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = days[new Date().getDay()];
  const t = timings.find((x) => x.day === today);
  if (!t) return null;
  if (t.closed) return { open: false, label: "Closed today" };
  return { open: true, label: `Open today · ${t.open} – ${t.close}` };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BusinessProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const { data: b } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", params.id)
    .single<BusinessRow>();

  if (!b) notFound();

  const social = b.social_links ?? {};
  const pictures = (b.pictures ?? []).slice(0, 2);
  const timings: DayTiming[] = b.timings ?? [];
  const status = todayStatus(timings);
  const hasSocial = social.instagram || social.facebook || social.youtube;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> NeopolisNews
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Logo */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-white/10 backdrop-blur-sm ring-2 ring-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-2xl">
              {b.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.logo}
                  alt={`${b.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-14 h-14 text-white/30" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left">

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-3 justify-center md:justify-start">
                {b.verified && (
                  <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                <span className="text-brand-300 text-sm font-medium">{b.industry}</span>
                {b.status !== "active" && (
                  <Link
                    href={`/businesses/${b.id}/claim`}
                    className="inline-flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-400/30 transition-colors"
                  >
                    <Flag className="w-3 h-3" /> Claim this business
                  </Link>
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                {b.name}
              </h1>

              {/* Type chips */}
              {b.types.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                  {b.types.map((t) => (
                    <span
                      key={t}
                      className="bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Address */}
              <div className="flex items-start gap-2 text-brand-200 mb-4 justify-center md:justify-start">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-sm leading-snug">{b.address}</span>
              </div>

              {/* Open / closed indicator */}
              {status && (
                <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                  <span
                    className={`w-2 h-2 rounded-full ${status.open ? "bg-green-400" : "bg-red-400"}`}
                  />
                  <span className={`text-sm font-medium ${status.open ? "text-green-300" : "text-red-300"}`}>
                    {status.label}
                  </span>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {b.contact_phone && (
                  <a
                    href={`tel:${b.contact_phone}`}
                    className="inline-flex items-center gap-2 bg-white text-brand-800 hover:bg-brand-50 font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg text-sm"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── PHOTOS ──────────────────────────────────────────────────────────── */}
      {pictures.length > 0 && (
        <section className="bg-brand-950">
          <div
            className={`max-w-4xl mx-auto grid gap-1 ${
              pictures.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {pictures.map((url, i) => (
              <div key={i} className="aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${b.name} photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-5 gap-6">

            {/* Left col — About + Contact + Social */}
            <div className="md:col-span-3 space-y-5">

              {/* About */}
              {b.description && (
                <div className="card p-6">
                  <h2 className="font-bold text-gray-900 text-base mb-3">
                    About {b.name}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{b.description}</p>
                </div>
              )}

              {/* What we offer */}
              {b.subtypes.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-bold text-gray-900 text-base mb-3">What We Offer</h2>
                  <div className="flex flex-wrap gap-2">
                    {b.subtypes.map((s) => (
                      <span
                        key={s}
                        className="bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Social */}
              {(b.contact_phone || hasSocial) && (
                <div className="card p-6">
                  <h2 className="font-bold text-gray-900 text-base mb-4">
                    Contact &amp; Connect
                  </h2>
                  <div className="space-y-3">
                    {b.contact_phone && (
                      <a
                        href={`tel:${b.contact_phone}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-brand-600 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                          <Phone className="w-4 h-4 text-brand-600" />
                        </div>
                        <span className="text-sm font-medium">{b.contact_phone}</span>
                      </a>
                    )}
                    {social.instagram && (
                      <a
                        href={social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-pink-600 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                          <Instagram className="w-4 h-4 text-pink-500" />
                        </div>
                        <span className="text-sm font-medium">Instagram</span>
                      </a>
                    )}
                    {social.facebook && (
                      <a
                        href={social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-700 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Facebook className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Facebook</span>
                      </a>
                    )}
                    {social.youtube && (
                      <a
                        href={social.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <Youtube className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-sm font-medium">YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right col — Hours */}
            {timings.length > 0 && (
              <div className="md:col-span-2">
                <div className="card p-6 sticky top-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <h2 className="font-bold text-gray-900 text-base">Business Hours</h2>
                  </div>
                  <div className="space-y-0.5">
                    {timings.map((t) => {
                      const isToday =
                        t.day ===
                        ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][
                          new Date().getDay()
                        ];
                      return (
                        <div
                          key={t.day}
                          className={`flex items-center justify-between py-2 text-sm ${
                            isToday
                              ? "bg-brand-50 -mx-2 px-2 rounded-lg"
                              : "border-b border-gray-50 last:border-0"
                          }`}
                        >
                          <span
                            className={`font-medium w-24 ${
                              isToday ? "text-brand-700" : "text-gray-500"
                            }`}
                          >
                            {t.day.slice(0, 3)}
                            {isToday && (
                              <span className="ml-1.5 text-[10px] font-bold text-brand-500 uppercase tracking-wide">
                                Today
                              </span>
                            )}
                          </span>
                          {t.closed ? (
                            <span className="text-gray-300 text-xs">Closed</span>
                          ) : (
                            <span
                              className={`font-semibold ${
                                isToday ? "text-brand-700" : "text-gray-800"
                              }`}
                            >
                              {t.open} – {t.close}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER STRIP ────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>
              Listed on{" "}
              <Link href="/" className="text-brand-600 hover:underline font-medium">
                NeopolisNews
              </Link>
            </span>
          </div>
          {b.verified && (
            <div className="flex items-center gap-1.5 text-green-600">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-medium">Verified Business</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
