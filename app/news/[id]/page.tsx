import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Newspaper } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { toArticle } from "@/lib/newsStore";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("articles")
    .select("title, excerpt, image_url")
    .eq("id", params.id)
    .eq("status", "published")
    .single();

  if (!data) return { title: "Article Not Found — NeopolisNews" };

  return {
    title: `${data.title} — NeopolisNews`,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      ...(data.image_url ? { images: [data.image_url] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const [{ data: articleData }, { data: relatedData }] = await Promise.all([
    admin
      .from("articles")
      .select("*")
      .eq("id", params.id)
      .eq("status", "published")
      .single(),
    // Related fetched after — needs category. Resolved below.
    Promise.resolve({ data: null }),
  ]);

  if (!articleData) notFound();

  const article = toArticle(articleData);
  const paragraphs = article.content.split(/\n\n+/).filter(Boolean);

  const { data: related } = await admin
    .from("articles")
    .select("id, title, excerpt, tag, tag_color, date, read_time, image_url")
    .eq("status", "published")
    .eq("category", article.category)
    .neq("id", article.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const relatedArticles = (related ?? []) as {
    id: string;
    title: string;
    excerpt: string;
    tag: string;
    tag_color: string;
    date: string;
    read_time: string;
    image_url: string | null;
  }[];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All News
          </Link>
          <span className={`${article.tagColor} mb-4`}>{article.tag}</span>
          <h1 className="text-2xl md:text-4xl font-extrabold mt-3 mb-4 leading-snug">
            {article.title}
          </h1>
          <p className="text-gray-300 text-base leading-relaxed mb-5">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="font-medium text-gray-300">{article.author}</span>
            <span>{article.date}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTime} read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString("en-IN")} views
            </span>
            {article.sponsored && (
              <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full">
                Sponsored
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cover image */}
      {article.imageUrl && (
        <div className="bg-gray-900">
          <div className="max-w-3xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full max-h-80 object-cover"
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed text-base">
              {p}
            </p>
          ))}
        </div>

        {article.source && (
          <p className="text-sm text-gray-400 mt-8 pt-6 border-t border-gray-100">
            Source:{" "}
            <span className="font-medium text-gray-500">{article.source}</span>
          </p>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              More in {article.tag}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedArticles.map((r) => (
                <Link
                  key={r.id}
                  href={`/news/${r.id}`}
                  className="card p-4 hover:shadow-md transition-shadow block"
                >
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.image_url}
                      alt={r.title}
                      className="h-28 w-full object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="h-28 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <span className={`${r.tag_color} text-xs`}>{r.tag}</span>
                  <p className="font-semibold text-gray-900 text-sm mt-1.5 leading-snug line-clamp-2">
                    {r.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {r.date} · {r.read_time}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 text-sm mt-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all news
        </Link>
      </div>
    </div>
  );
}
