"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, MapPin, Loader2 } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { TAXONOMY, getTypes, getSubtypes } from "@/lib/businessDirectory";

export const dynamic = "force-dynamic";

const INDUSTRIES = Object.keys(TAXONOMY);

interface Business {
  id: string;
  name: string;
  industry: string;
  types: string[];
  subtypes: string[];
  address: string | null;
  logo: string | null;
  verified: boolean;
}

export default function BusinessesPage() {
  const [industry, setIndustry] = useState<string | null>(null);
  const [type, setType]         = useState<string | null>(null);
  const [subtype, setSubtype]   = useState<string | null>(null);
  const [all, setAll]           = useState<Business[]>([]);
  const [loading, setLoading]   = useState(false);

  const types    = industry ? getTypes(industry) : [];
  const subtypes = industry && type ? getSubtypes(industry, type) : [];

  const displayed = all.filter((b) => {
    if (type    && !b.types?.includes(type))       return false;
    if (subtype && !b.subtypes?.includes(subtype)) return false;
    return true;
  });

  useEffect(() => {
    if (!industry) { setAll([]); return; }
    setLoading(true);
    fetch(`/api/businesses?industry=${encodeURIComponent(industry)}&limit=100`)
      .then((r) => r.json())
      .then((data) => setAll(Array.isArray(data) ? data : []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, [industry]);

  function selectIndustry(ind: string) {
    setIndustry((prev) => (prev === ind ? null : ind));
    setType(null);
    setSubtype(null);
  }

  function selectType(t: string) {
    setType((prev) => (prev === t ? null : t));
    setSubtype(null);
  }

  function selectSubtype(s: string) {
    setSubtype((prev) => (prev === s ? null : s));
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-10 md:py-14">
        <SectionWrapper tight>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-2">Browse Businesses</h1>
          <p className="text-brand-200 text-sm md:text-base">
            Filter by category, type, and speciality to find exactly what you need.
          </p>
        </SectionWrapper>
      </section>

      {/* Industry tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-[calc(4rem+28px)] z-30">
        <SectionWrapper tight>
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => selectIndustry(ind)}
                className={`px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                  industry === ind
                    ? "bg-brand-600 text-white border-brand-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Type pills */}
      {industry && types.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-100">
          <SectionWrapper tight>
            <div className="flex gap-2 overflow-x-auto py-2.5 scrollbar-none">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => selectType(t)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    type === t
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-gray-200 text-gray-600 bg-white hover:border-gray-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* Subtype chips */}
      {type && subtypes.length > 0 && (
        <div className="bg-white border-b border-gray-100">
          <SectionWrapper tight>
            <div className="flex flex-wrap gap-2 py-3">
              {subtypes.map((s) => (
                <button
                  key={s}
                  onClick={() => selectSubtype(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    subtype === s
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* Results */}
      <SectionWrapper>
        {!industry ? (
          <div className="text-center py-24 text-gray-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">Select a category to browse businesses</p>
            <p className="text-sm mt-1 text-gray-400">Then narrow by type and speciality.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30 text-gray-300" />
            <p className="font-medium text-gray-500">No businesses found</p>
            <p className="text-sm mt-1 text-gray-400">Try a different filter or check back later.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-5">
              {displayed.length} business{displayed.length !== 1 ? "es" : ""}
              {subtype ? ` · ${subtype}` : type ? ` · ${type}` : ` · ${industry}`}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayed.map((b) => (
                <Link
                  key={b.id}
                  href={`/businesses/${b.id}`}
                  className="card p-4 flex items-start gap-3 hover:border-brand-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                    {b.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                      : <Building2 className="w-6 h-6 text-brand-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-gray-900 group-hover:text-brand-700 truncate">{b.name}</p>
                      {b.verified && <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-brand-600 font-medium mt-0.5">{b.industry}</p>
                    {b.address && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />{b.address}
                      </p>
                    )}
                    {b.types?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {b.types.slice(0, 2).map((t) => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </SectionWrapper>
    </>
  );
}
