import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";

const client = new Anthropic();

// Sonnet (same model as the digest routes): translation must finish well inside
// Vercel's 60s function window — a single slow full-article call 504s.
const MODEL = "claude-sonnet-4-6";

const TRANSLATOR_ROLE = `You are a professional Telugu news translator for NeopolisNews, a hyperlocal news platform for the Neopolis urban district (Kokapet & Narsingi, Hyderabad).

Rules:
1. Write natural, fluent Telugu in the register of a quality Telugu newspaper (like Eenadu or Andhra Jyothi) — not a word-for-word literal translation
2. Preserve any HTML structure EXACTLY — keep every tag (<p>, <h2>, <ul>, <li>, <strong>, <a> with its href, etc.) in place and translate only the text inside them
3. Keep proper nouns recognizable: place names, project names, company names and person names may be transliterated into Telugu script, but keep well-known brand/product names, abbreviations (IT, ORR, HMDA, GHMC), and numbers as they are
4. Keep "NeopolisNews" in Latin script
5. Do not add, remove, or reorder any information`;

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

async function complete(prompt: string, maxTokens: number): Promise<string> {
  // Streaming avoids SDK HTTP timeouts (Telugu output is token-heavy).
  const message = await client.messages
    .stream({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    })
    .finalMessage();

  const textBlock = message.content.find((b) => b.type === "text");
  if (textBlock?.type !== "text") {
    throw new Error("Translation response contained no text");
  }
  return textBlock.text
    .trim()
    .replace(/^```(?:html|json)?\s*/i, "")
    .replace(/```\s*$/i, "");
}

/** Split flat article HTML into chunks on top-level block boundaries so the
 *  chunks can be translated in parallel and re-joined without altering markup. */
function chunkHtml(html: string, targetChars = 2200): string[] {
  const segments = html
    .split(/(?=<(?:p|h[1-6]|ul|ol|blockquote|table|figure)\b)/gi)
    .filter((s) => s.trim());

  const chunks: string[] = [];
  let current = "";
  for (const seg of segments) {
    if (current && current.length + seg.length > targetChars) {
      chunks.push(current);
      current = "";
    }
    current += seg;
  }
  if (current.trim()) chunks.push(current);
  return chunks.length > 0 ? chunks : [html];
}

async function translateHtmlChunk(chunk: string): Promise<string> {
  const prompt = `${TRANSLATOR_ROLE}

Translate the following HTML fragment of a news article from English to Telugu.

Respond with ONLY the translated HTML fragment — no markdown fences, no commentary, no extra text.

HTML FRAGMENT:
${chunk}`;
  return complete(prompt, 4096);
}

async function translateMeta(
  title: string,
  excerpt: string
): Promise<{ title: string; excerpt: string }> {
  const prompt = `${TRANSLATOR_ROLE}

Translate this news article's title and excerpt from English to Telugu.

ENGLISH TITLE:
${title}

ENGLISH EXCERPT:
${excerpt}

Format your response as valid JSON ONLY (no markdown fences) with this exact structure:
{
  "title": "Telugu translation of the title",
  "excerpt": "Telugu translation of the excerpt"
}`;
  const parsed = JSON.parse(await complete(prompt, 1024)) as {
    title: string;
    excerpt: string;
  };
  if (!parsed.title || !parsed.excerpt) {
    throw new Error("Translation response missing fields");
  }
  return parsed;
}

/** Translate an article's title, excerpt and HTML body into Telugu.
 *  Body chunks run in parallel so wall time stays inside serverless limits. */
export async function translateToTelugu(
  article: Pick<TranslatableArticle, "title" | "excerpt" | "content">
): Promise<ArticleTranslation> {
  const [meta, ...contentChunks] = await Promise.all([
    translateMeta(article.title, article.excerpt),
    ...chunkHtml(article.content).map(translateHtmlChunk),
  ]);
  return { ...meta, content: contentChunks.join("") };
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
