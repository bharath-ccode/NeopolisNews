"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, Building2, Home, Newspaper, ShieldCheck,
  MapPin, Loader2, ArrowLeft,
} from "lucide-react";
import clsx from "clsx";

interface BizResult {
  id: string;
  name: string;
  industry: string;
  address: string;
  verified: boolean;
  logo: string | null;
}

interface PropResult {
  id: string;
  property_type: string;
  bedrooms: string | null;
  price: string;
  listing_type: string;
  project_name: string | null;
  standalone_description: string | null;
  sub_category: string;
  is_standalone: boolean;
}

interface ArticleResult {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  tag_color: string;
}

interface SearchResults {
  businesses: BizResult[];
  properties: PropResult[];
  articles: ArticleResult[];
}

const EMPTY: SearchResults = { businesses: [], properties: [], articles: [] };

function propTitle(p: PropResult) {
  return p.bedrooms ? `${p.bedrooms} BHK ${p.property_type}` : p.property_type;
}
function propLocation(p: PropResult) {
  return p.is_standalone ? (p.standalone_description ?? "Standalone") : (p.project_name ?? "Neopolis");
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(EMPTY); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    router.replace(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
    doSearch(query.trim());
  }

  const total = results.businesses.length + results.properties.length + results.articles.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-bold text-gray-700">Search NeopolisNews</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Businesses, properties, news…"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
              />
              {loading && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-brand-500" />
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* Not yet searched */}
        {!searched && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Search businesses, properties and news across Neopolis.</p>
          </div>
        )}

        {/* No results */}
        {searched && !loading && total === 0 && (
          <div className="text-center py-20">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-gray-400 mt-1">Try a different spelling or broader term.</p>
          </div>
        )}

        {/* Results */}
        {searched && !loading && total > 0 && (
          <>
            <p className="text-xs text-gray-400">{total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;</p>

            {/* Businesses */}
            {results.businesses.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Businesses
                </h2>
                <div className="space-y-2">
                  {results.businesses.map((b) => (
                    <Link key={b.id} href={`/businesses/${b.id}`} className="card p-4 flex items-center gap-3 hover:border-brand-200 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 overflow-hidden flex items-center justify-center shrink-0">
                        {b.logo
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                          : <Building2 className="w-5 h-5 text-brand-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700 truncate">{b.name}</p>
                          {b.verified && <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{b.industry} · {b.address}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Properties */}
            {results.properties.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Home className="w-3.5 h-3.5" /> Properties
                </h2>
                <div className="space-y-2">
                  {results.properties.map((p) => (
                    <Link key={p.id} href="/real-estate/classifieds" className="card p-4 flex items-center gap-3 hover:border-brand-200 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5 text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700 capitalize truncate">{propTitle(p)}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{propLocation(p)}</span>
                          <span className={clsx("font-semibold", p.listing_type === "sale" ? "text-blue-600" : "text-green-600")}>
                            ₹{p.price}{p.listing_type === "rent" ? "/mo" : ""}
                          </span>
                        </div>
                      </div>
                      <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full shrink-0", p.listing_type === "sale" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700")}>
                        For {p.listing_type === "sale" ? "Sale" : "Rent"}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Articles */}
            {results.articles.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Newspaper className="w-3.5 h-3.5" /> News
                </h2>
                <div className="space-y-2">
                  {results.articles.map((a) => (
                    <Link key={a.id} href={`/news/${a.id}`} className="card p-4 hover:border-brand-200 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <Newspaper className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700 line-clamp-1">{a.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{a.excerpt}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`badge text-xs ${a.tag_color}`}>{a.tag}</span>
                            <span className="text-xs text-gray-300">{a.date}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
