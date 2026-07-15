import type { SupabaseClient } from "@supabase/supabase-js";

// Google Cloud Translation API v2 — requires GOOGLE_TRANSLATE_API_KEY
// (Cloud Console → enable "Cloud Translation API" → create API key).
const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

export interface ArticleTranslation {
  title: string;
  excerpt: string;
  content: string;
}

interface TranslatableArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
}

/** The v2 API returns translatedText with HTML entities even in text mode. */
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

async function googleTranslate(
  q: string[],
  format: "text" | "html"
): Promise<string[]> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_TRANSLATE_API_KEY is not set");

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, source: "en", target: "te", format }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Translate ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    data?: { translations?: { translatedText: string }[] };
  };
  const translations = json.data?.translations;
  if (!translations || translations.length !== q.length) {
    throw new Error("Google Translate returned an unexpected response shape");
  }
  return translations.map((t) => t.translatedText);
}

/** Translate an article's title, excerpt and HTML body into Telugu.
 *  format:"html" makes Google preserve the markup and translate only text nodes. */
export async function translateToTelugu(
  article: Pick<TranslatableArticle, "title" | "excerpt" | "content">
): Promise<ArticleTranslation> {
  const [[title, excerpt], [content]] = await Promise.all([
    googleTranslate([article.title, article.excerpt], "text"),
    googleTranslate([article.content], "html"),
  ]);
  return {
    title: decodeEntities(title),
    excerpt: decodeEntities(excerpt),
    content,
  };
}

/** Fetch the cached Telugu translation for an article, or null if none exists. */
export async function getTranslation(
  sb: SupabaseClient,
  articleId: string,
  lang = "te"
): Promise<ArticleTranslation | null> {
  const { data } = await sb
    .from("article_translations")
    .select("title, excerpt, content")
    .eq("article_id", articleId)
    .eq("lang", lang)
    .maybeSingle();
  return (data as ArticleTranslation | null) ?? null;
}

/** Return the cached Telugu translation, translating and caching it on first request. */
export async function getOrCreateTeluguTranslation(
  sb: SupabaseClient,
  article: TranslatableArticle
): Promise<{ translation: ArticleTranslation; cached: boolean }> {
  const existing = await getTranslation(sb, article.id, "te");
  if (existing) return { translation: existing, cached: true };

  const translation = await translateToTelugu(article);

  // Upsert so a concurrent first-reader race just overwrites with an equivalent row.
  const { error } = await sb
    .from("article_translations")
    .upsert(
      {
        article_id: article.id,
        lang: "te",
        title: translation.title,
        excerpt: translation.excerpt,
        content: translation.content,
      },
      { onConflict: "article_id,lang" }
    );
  if (error) throw new Error(error.message);

  return { translation, cached: false };
}
