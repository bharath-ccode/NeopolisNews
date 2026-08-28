import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Languages, Newspaper } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { toArticle, extractYouTubeId } from "@/lib/newsStore";
import { getTranslation } from "@/lib/translate";
import ViewTracker from "./ViewTracker";
import CommentsSection from "./CommentsSection";
import AutoTranslate from "./AutoTranslate";
import WhatsAppShare from "@/components/WhatsAppShare";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

// --font-telugu is the self-hosted Noto Sans Telugu loaded in the root layout.
const TELUGU_FONT = {
  fontFamily: 'var(--font-telugu), "Noto Sans Telugu", "Nirmala UI", sans-serif',
};

export type ArticleLang = "en" | "te";

function articleUrls(id: string) {
  return { en: `${SITE_URL}/news/${id}`, te: `${SITE_URL}/news/te/${id}` };
}

/** Shared metadata for /news/[id] (en) and /news/te/[id] (te). */
export async function buildArticleMetadata(
  id: string,
  lang: ArticleLang
): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("articles")
    .select("title, excerpt, image_url")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!data) return { title: "Article Not Found — NeopolisNews" };

  const urls = articleUrls(id);
  const translation = lang === "te" ? await getTranslation(admin, id, "te") : null;
  const title = translation?.title ?? data.title;
  const excerpt = translation?.excerpt ?? data.excerpt;

  return {
    title: `${title} | NeopolisNews`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      url: urls[lang],
      siteName: "NeopolisNews",
      type: "article",
      ...(data.image_url ? { images: [{ url: data.image_url }] } : {}),
    },
    alternates: {
      canonical: urls[lang],
      languages: { en: urls.en, te: urls.te, "x-default": urls.en },
    },
    // Until the Telugu translation is cached, the te URL serves English text —
    // keep it out of the index so Google never sees duplicate English content.
    ...(lang === "te" && !translation ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ArticleView(
  { id, lang }: { id: string; lang: ArticleLang }
) {
  const admin = createAdminClient();

  const { data: articleData } = await admin
    .from("articles")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!articleData) notFound();

  const article = toArticle(articleData);
  const digestLevel: string | null = articleData.digest_level ?? null;
  const urls = articleUrls(article.id);

  // Telugu view: server-render the cached translation when it exists;
  // otherwise fall back to English and let <AutoTranslate> generate + refresh.
  const wantsTelugu = lang === "te";
  const translation = wantsTelugu ? await getTranslation(admin, article.id, "te") : null;
  const isTelugu = wantsTelugu && translation !== null;
  const displayTitle = translation?.title ?? article.title;
  const displayExcerpt = translation?.excerpt ?? article.excerpt;
  const displayContent = translation?.content ?? article.content;
  const teluguStyle = isTelugu ? TELUGU_FONT : undefined;
  const articlePath = wantsTelugu ? `/news/te/` : `/news/`;

  // For digest articles: match by digest_level so city stays city, etc.
  // For regular articles: match by category.
  const relatedQuery = admin
    .from("articles")
    .select("id, title, excerpt, tag, tag_color, date, read_time, image_url, digest_level")
    .eq("status", "published")
    .neq("id", article.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: related } = await (digestLevel
    ? relatedQuery.eq("digest_level", digestLevel)
    : relatedQuery.eq("category", article.category));

  const relatedArticles = (related ?? []) as {
    id: string;
    title: string;
    excerpt: string;
    tag: string;
    tag_color: string;
    date: string;
    read_time: string;
    image_url: string | null;
    digest_level: string | null;
  }[];

  const LEVEL_LABELS: Record<string, string> = {
    international: "International",
    national:      "National",
    state:         "Telangana",
    city:          "Hyderabad",
  };
  const relatedHeading = digestLevel
    ? `More from ${LEVEL_LABELS[digestLevel] ?? digestLevel} Digest`
    : `More in ${article.tag}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: displayTitle,
    description: displayExcerpt,
    articleBody: displayContent,
    inLanguage: isTelugu ? "te" : "en",
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "NeopolisNews",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": wantsTelugu ? urls.te : urls.en,
    },
    ...(article.imageUrl
      ? { image: [{ "@type": "ImageObject", url: article.imageUrl }] }
      : {}),
  };

  return (
    <div className="bg-white min-h-screen">
      <ViewTracker articleId={article.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {wantsTelugu && !translation && <AutoTranslate articleId={article.id} />}
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All News
            </Link>
            {/* Language toggle */}
            <div className="inline-flex items-center gap-1 bg-white/10 rounded-full p-1 text-xs font-semibold">
              <Languages className="w-3.5 h-3.5 text-gray-300 ml-1.5" aria-hidden />
              <Link
                href={`/news/${article.id}`}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  !wantsTelugu ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"
                }`}
              >
                English
              </Link>
              <Link
                href={`/news/te/${article.id}`}
                lang="te"
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  wantsTelugu ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"
                }`}
                style={TELUGU_FONT}
              >
                తెలుగు
              </Link>
            </div>
          </div>
          <div className="mt-5 mb-4">
            <span className={article.tagColor}>{article.tag}</span>
          </div>
          <h1
            className="text-2xl md:text-4xl font-extrabold mt-3 mb-3 leading-snug"
            lang={isTelugu ? "te" : "en"}
            style={teluguStyle}
          >
            {displayTitle}
          </h1>
          <div className="flex items-center gap-1.5 mb-4">
            <Eye className="w-4 h-4 text-brand-400" />
            <span className="text-brand-300 font-semibold text-sm">
              {article.views.toLocaleString("en-IN")} views
            </span>
          </div>
          <p
            className="text-gray-300 text-base leading-relaxed mb-5"
            lang={isTelugu ? "te" : "en"}
            style={teluguStyle}
          >
            {displayExcerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="font-medium text-gray-300">{article.author}</span>
            <span>{article.date}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTime} read
            </span>
            {article.sponsored && (
              <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full">
                Sponsored
              </span>
            )}
          </div>
          <div className="mt-5">
            <WhatsAppShare
              title={`📰 ${displayTitle} — NeopolisNews`}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Cover image — shown in full (no crop); section height follows the image */}
      {article.imageUrl && (
        <div className="bg-gray-900">
          <div className="max-w-3xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* YouTube embed */}
      {article.videoUrl && (() => {
        const videoId = extractYouTubeId(article.videoUrl);
        return videoId ? (
          <div className="bg-gray-900">
            <div className="max-w-3xl mx-auto">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={article.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div
          lang={isTelugu ? "te" : "en"}
          style={teluguStyle}
          className="article-body text-gray-700 leading-relaxed text-base space-y-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:leading-relaxed
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
            [&_li]:text-gray-700
            [&_strong]:font-semibold [&_strong]:text-gray-900
            [&_a]:text-brand-600 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />

        {isTelugu && (
          <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
            ఈ కథనం ఆంగ్ల మూలం నుండి స్వయంచాలకంగా అనువదించబడింది. (This article was
            automatically translated from the English original.){" "}
            <Link href={`/news/${article.id}`} className="text-brand-600 underline">
              Read the original in English
            </Link>
          </p>
        )}

        {article.source && (
          <p className="text-sm text-gray-400 mt-8 pt-6 border-t border-gray-100">
            Source:{" "}
            <span className="font-medium text-gray-500">{article.source}</span>
          </p>
        )}

        {/* Reactions + comments */}
        <CommentsSection articleId={article.id} />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {relatedHeading}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedArticles.map((r) => (
                <Link
                  key={r.id}
                  href={`${articlePath}${r.id}`}
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
