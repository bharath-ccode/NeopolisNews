import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";
import { LEVEL_LABELS, LEVEL_TAGS, LEVEL_SCOPE, type DigestLevel, type HeadlineItem } from "@/lib/digestSources";

export const maxDuration = 60;

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { articleId, feedback } = (await req.json()) as {
    articleId: string;
    feedback: string;
  };

  if (!articleId || !feedback?.trim()) {
    return NextResponse.json({ error: "articleId and feedback are required" }, { status: 400 });
  }

  const sb = createAdminClient();

  const { data: article, error: fetchErr } = await sb
    .from("articles")
    .select("id, title, content, excerpt, digest_level, digest_headlines")
    .eq("id", articleId)
    .eq("status", "draft")
    .single();

  if (fetchErr || !article) {
    return NextResponse.json({ error: "Draft article not found" }, { status: 404 });
  }

  const level = article.digest_level as DigestLevel;
  const headlines: HeadlineItem[] = JSON.parse(
    typeof article.digest_headlines === "string"
      ? article.digest_headlines
      : JSON.stringify(article.digest_headlines ?? [])
  );

  const headlineText = headlines
    .map((h, i) => `${i + 1}. [${h.source}] ${h.title}${h.description ? ` — ${h.description}` : ""}`)
    .join("\n");

  const levelLabel = LEVEL_LABELS[level];
  const tag = LEVEL_TAGS[level];

  const prompt = `You are a journalist for NeopolisNews, a news platform for Hyderabad's business and IT professionals.

${LEVEL_SCOPE[level]}

The original ${levelLabel} headlines (stay strictly within this geographic scope):
${headlineText}

Previous article version:
Title: ${article.title}
Excerpt: ${article.excerpt}
Content:
${article.content}

Admin feedback for improvement:
"${feedback}"

Rewrite the article incorporating this feedback. Maintain:
- Strict geographic scope (${LEVEL_LABELS[level]} only — no news from outside this level)
- Slightly progressive, worker-friendly perspective
- Focus on impact for Hyderabad IT/business professionals
- Factual and analytical tone (like The Hindu or The Wire editorial voice)

Format your response as valid JSON ONLY (no markdown fences):
{
  "title": "Revised headline under 80 characters for ${tag} digest",
  "excerpt": "Revised 2-sentence summary under 220 characters",
  "content": "Revised full HTML article with <p>, <h2>, <ul><li> tags. Minimum 350 words.",
  "readTime": "X min read"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (message.content[0] as { type: string; text: string }).text.trim();
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  const generated = JSON.parse(cleaned) as {
    title: string;
    excerpt: string;
    content: string;
    readTime: string;
  };

  const { error: updateErr } = await sb
    .from("articles")
    .update({
      title:     generated.title,
      excerpt:   generated.excerpt,
      content:   generated.content,
      read_time: generated.readTime,
    })
    .eq("id", articleId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, article: { ...article, ...generated } });
}
