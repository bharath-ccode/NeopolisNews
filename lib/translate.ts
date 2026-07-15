import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";

const client = new Anthropic();

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

/** Translate an article's title, excerpt and HTML body into Telugu. */
export async function translateToTelugu(
  article: Pick<TranslatableArticle, "title" | "excerpt" | "content">
): Promise<ArticleTranslation> {
  const prompt = `You are a professional Telugu news translator for NeopolisNews, a hyperlocal news platform for the Neopolis urban district (Kokapet & Narsingi, Hyderabad).

Translate the following news article from English to Telugu.

Rules:
1. Write natural, fluent Telugu in the register of a quality Telugu newspaper (like Eenadu or Andhra Jyothi) — not a word-for-word literal translation
2. Preserve the HTML structure of the content EXACTLY — keep every tag (<p>, <h2>, <ul>, <li>, <strong>, <a> with its href, etc.) in place and translate only the text inside them
3. Keep proper nouns recognizable: place names, project names, company names and person names may be transliterated into Telugu script, but keep well-known brand/product names, abbreviations (IT, ORR, HMDA, GHMC), and numbers as they are
4. Keep "NeopolisNews" in Latin script
5. Do not add, remove, or reorder any information

ENGLISH TITLE:
${article.title}

ENGLISH EXCERPT:
${article.excerpt}

ENGLISH CONTENT (HTML):
${article.content}

Format your response as valid JSON ONLY (no markdown fences) with this exact structure:
{
  "title": "Telugu translation of the title",
  "excerpt": "Telugu translation of the excerpt",
  "content": "Telugu translation of the full HTML content, tags preserved"
}`;

  // Streaming avoids SDK HTTP timeouts on long articles (Telugu output is token-heavy).
  const message = await client.messages
    .stream({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    })
    .finalMessage();

  const textBlock = message.content.find((b) => b.type === "text");
  if (textBlock?.type !== "text") {
    throw new Error("Translation response contained no text");
  }
  const text = textBlock.text.trim();
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  const parsed = JSON.parse(cleaned) as ArticleTranslation;

  if (!parsed.title || !parsed.excerpt || !parsed.content) {
    throw new Error("Translation response missing fields");
  }
  return parsed;
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
