"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HardHat, CalendarDays, Clock, ArrowRight, Building2,
} from "lucide-react";
import { toArticle, Article } from "@/lib/newsStore";
import SectionWrapper from "@/components/SectionWrapper";

export default function ConstructionUpdatesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles?category=construction&status=published")
      .then((r) => r.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data.map(toArticle) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-900 to-orange-700 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <span className="inline-flex items-center gap-1.5 bg-orange-700 border border-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            <HardHat className="w-3.5 h-3.5" /> Construction Updates
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
            What&apos;s Being <span className="text-orange-300">Built</span>
          </h1>
          <p className="text-orange-100 text-lg max-w-2xl">
            Live construction progress from projects across the Neopolis district — milestones, floor completions, and site updates straight from builders.
          </p>
        </SectionWrapper>
      </section>

      {/* Updates list */}
      <SectionWrapper>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <HardHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">No construction updates yet</p>
            <p className="text-sm mt-1">Builders will post updates as work progresses.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-6">
              {articles.length} update{articles.length !== 1 ? "s" : ""}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/news/${a.id}`}
                  className="card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Cover image */}
                  {a.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.imageUrl}
                      alt={a.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-orange-50 flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-orange-200" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Tag */}
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full w-fit mb-3">
                      <HardHat className="w-3 h-3" /> Construction
                    </span>

                    <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 flex-1 mb-4">
                      {a.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" /> {a.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {a.readTime}
                      </span>
                    </div>

                    <span className="mt-3 text-xs font-semibold text-orange-600 flex items-center gap-1">
                      Read Update <ArrowRight className="w-3 h-3" />
                    </span>
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
