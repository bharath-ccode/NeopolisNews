import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";
import { LEVEL_SCOPE, isLikelyUrl, fetchArticleSource, type HeadlineItem } from "@/lib/digestSources";

export const maxDuration = 60;

const client = new Anthropic();

// Editor's Desk pieces are opinion/analysis — always filed under Editorial.
const EDITORIAL = { tag: "Editorial", tagColor: "tag-slate" };

/** POST { headlines: string[] (1–3), pointer: string }
 *  Editor's Desk mode: the editor supplies the leads and the angle; the AI
 *  only does the writing. Output is always categorised as Editorial. Draft
 *  lands in the same review queue as the auto-generated digest
 *  (regenerate-with-feedback and approve work as-is). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { headlines, pointer } = (body ?? {}) as {
    headlines?: string[]; pointer?: string;
  };

  const cleanHeadlines = (Array.isArray(headlines) ? headlines : [])
    .map((h) => (typeof h === "string" ? h.trim() : ""))
    .filter(Boolean);

  if (cleanHeadlines.length < 1 || cleanHeadlines.length > 3)
    return NextResponse.json({ error: "Provide 1 to 3 headlines or links." }, { status: 400 });
  if (!pointer?.trim())
    return NextResponse.json({ error: "The pointer (story direction) is required." }, { status: 400 });
  if (pointer.trim().length > 2000)
    return NextResponse.json({ error: "Pointer is too long (max 2000 characters)." }, { status: 400 });

  // Each headline slot may be typed text, or a pasted link to a specific
  // news item — fetched and stripped the same way the cartoon generator
  // grounds on a pasted article, so the model works from the real story
  // instead of just a one-line headline.
  const linkWarnings: string[] = [];
  const resolved = await Promise.all(
    cleanHeadlines.map(async (h) => {
      if (!isLikelyUrl(h)) return { kind: "headline" as const, text: h };
      try {
        const source = await fetchArticleSource(h);
        return { kind: "link" as const, url: h, pageTitle: source.pageTitle || h, text: source.text };
      } catch (err) {
        linkWarnings.push(`Couldn't fetch ${h} (${String(err instanceof Error ? err.message : err)}) — using the link text as the headline instead.`);
        return { kind: "headline" as const, text: h };
      }
    })
  );

  const headlineText = resolved
    .map((item, i) =>
      item.kind === "link"
        ? `${i + 1}. [Fetched from link] ${item.pageTitle}\n${item.text}`
        : `${i + 1}. ${item.text}`
    )
    .join("\n\n");

  const prompt = `You are a journalist for NeopolisNews, a hyperlocal news platform for the Neopolis urban district (Kokapet & Narsingi, Hyderabad) — read by residents, IT professionals, home buyers and local business owners.

${LEVEL_SCOPE.editor}

The editor has briefed you with these headline(s)/lead(s):
${headlineText}

EDITOR'S POINTER (this defines the story — follow it faithfully):
"${pointer.trim()}"

Write one news story that:
1. Develops the story exactly along the editor's pointer — the pointer decides the angle, what to emphasize, and what to leave out
2. Uses the given headlines as the factual leads; do NOT invent specific facts, quotes, statistics or dates that are not implied by the brief — where detail is missing, write around it rather than fabricating
3. Is factual, grounded and analytical — not sensational
4. Reads like The Hindu or The Wire: thoughtful, people-focused

Format your response as valid JSON ONLY (no markdown fences) with this exact structure:
{
  "title": "Compelling headline under 80 characters",
  "excerpt": "2-sentence summary under 220 characters",
  "content": "Full article body in HTML. Use <p> for paragraphs, <h2> for section headers, <ul><li> for lists. Minimum 300 words. If relevant, end with a short 'What This Means for You' section — 2 to 3 sentences, ONE concrete and specific takeaway for a Neopolis/Kokapet resident or professional. Do not restate the article or pad it with generic advice; omit the section entirely if there's no real local angle.",
  "readTime": "X min read"
}`;

  let generated: { title: string; excerpt: string; content: string; readTime: string };
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const text = (message.content[0] as { type: string; text: string }).text.trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    generated = JSON.parse(cleaned);
  } catch (err) {
    return NextResponse.json({ error: `Generation failed: ${String(err)}` }, { status: 502 });
  }

  // Store the brief in the same shape the regenerate route expects, so
  // feedback-driven rewrites keep the pointer, headlines and any fetched
  // link content as context.
  const digestHeadlines: HeadlineItem[] = [
    { source: "Editor's pointer", title: pointer.trim(), description: "" },
    ...resolved.map((item) =>
      item.kind === "link"
        ? { source: "Editor link", title: item.pageTitle, description: item.text.slice(0, 1500) }
        : { source: "Editor headline", title: item.text, description: "" }
    ),
  ];

  const todayIST = getTodayIST();
  const sb = createAdminClient();

  const { data: inserted, error } = await sb
    .from("articles")
    .insert({
      title:            generated.title,
      excerpt:          generated.excerpt,
      content:          generated.content,
      category:         "editorial",
      tag:              EDITORIAL.tag,
      tag_color:        EDITORIAL.tagColor,
      author:           "NeopolisNews Desk",
      date:             formatDisplayDate(todayIST),
      read_time:        generated.readTime,
      views:            0,
      sponsored:        false,
      status:           "draft",
      digest_date:      todayIST,
      digest_level:     "editor",
      digest_headlines: JSON.stringify(digestHeadlines),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articleId: inserted.id, linkWarnings }, { status: 201 });
}

function getTodayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}
