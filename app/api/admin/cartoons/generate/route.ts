import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchHeadlines, stripHtml } from "@/lib/digestSources";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";
import { generateAiImage } from "@/lib/generateAiImage";
import { watermarkCartoon } from "@/lib/watermarkCartoon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new Anthropic();

interface GeneratedCartoon {
  title: string;
  caption: string;
  scene: string;
}

interface ArticleSource {
  url: string;
  pageTitle: string;
  text: string;
}

/** Fetches a specific article the admin pasted a link to. Extraction is
 *  deliberately crude (strip tags, no readability parsing) — same
 *  no-dependency approach as the RSS parsing in this file — since Claude
 *  only needs enough of the page to ground the cartoon, not a clean read. */
async function fetchArticleSource(url: string): Promise<ArticleSource> {
  const res = await fetch(url, {
    headers: { "User-Agent": "NeopolisNews/1.0 RSS Reader" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const pageTitle = titleMatch ? stripHtml(titleMatch[1]) : "";

  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const text = stripHtml(withoutScripts).slice(0, 3000);

  if (!text) throw new Error("No readable content found on that page");
  return { url, pageTitle, text };
}

function buildTextPrompt(opts: { headlineText?: string; source?: ArticleSource; notes?: string }): string {
  const { headlineText, source, notes } = opts;

  const material = source
    ? `The editor pasted this specific article to base the cartoon on:\nTitle: ${source.pageTitle}\nContent: ${source.text}`
    : `Today's local Hyderabad headlines:\n${headlineText}`;

  return `You write "Today in Neopolis," a daily single-panel gag cartoon about life in Kokapet/Narsingi, a fast-growing IT-corridor suburb of Hyderabad under heavy construction — new towers, traffic, real-estate launches, tech professionals commuting.

${material}
${notes ? `\nEditor's notes: ${notes}` : ""}

${source
  ? "Write a gentle, witty gag cartoon based on that article"
  : "Pick ONE headline (or a general Neopolis-life theme if none suit a cartoon) and write a gentle, witty gag cartoon about it"} — observational humor, not mean-spirited, that a Hyderabad tech professional would smile at.

Format your response as valid JSON ONLY (no markdown fences) with this exact structure:
{
  "title": "Short cartoon title under 60 characters, e.g. The Site Visit",
  "caption": "One witty punchline under 150 characters, the line under the panel",
  "scene": "One vivid sentence describing exactly what's drawn in the panel — characters, setting, action — for an illustrator. No dialogue or on-panel text."
}`;
}

/** Comic-strip framing, not the editorial-illustration one — this wants
 *  drawn characters and a gag, not abstract conceptual art. */
function buildImagenPrompt(scene: string): string {
  return [
    `Single-panel gag cartoon illustration for "Today in Neopolis," a daily comic strip about life in a fast-growing Indian tech-hub suburb near Hyderabad.`,
    `Scene: ${scene}`,
    "Style: colorful hand-drawn editorial cartoon, bold clean outlines, expressive exaggerated characters, warm satirical newspaper-comic tone.",
    "Strictly no text, no words, no letters, no numbers, no speech bubbles, no signage, no logos.",
    "Characters must be generic illustrated figures — not real, recognizable, or identifiable people, celebrities, or public figures.",
  ].join(" ");
}

/** POST { url?, notes? } — either base the cartoon on a specific article the
 *  admin pasted a link to, or pick from today's local headlines; either way
 *  "notes" steers the take. Writes a title/caption/scene with Claude,
 *  illustrates it with Gemini, and returns a ready-to-review draft for the
 *  admin form. Nothing is saved until the admin hits Publish/Save draft. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { url?: string; notes?: string };
  const url = body.url?.trim() || undefined;
  const notes = body.notes?.trim() || undefined;

  let source: ArticleSource | undefined;
  let headlineText: string | undefined;

  if (url) {
    try {
      source = await fetchArticleSource(url);
    } catch (err) {
      console.error("cartoon generate: article fetch failed:", err);
      const detail = err instanceof Error ? err.message : "";
      return NextResponse.json(
        { error: `Couldn't fetch that link${detail ? ` (${detail})` : ""} — check the URL and try again.` },
        { status: 400 }
      );
    }
  } else {
    const headlines = await fetchHeadlines("city");
    if (headlines.length === 0) {
      return NextResponse.json(
        { error: "No headlines available right now — try again shortly." },
        { status: 502 }
      );
    }
    headlineText = headlines
      .map((h, i) => `${i + 1}. [${h.source}] ${h.title}${h.description ? ` — ${h.description}` : ""}`)
      .join("\n");
  }

  let generated: GeneratedCartoon;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: buildTextPrompt({ headlineText, source, notes }) }],
    });
    const text = (message.content[0] as { type: string; text: string }).text.trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    generated = JSON.parse(cleaned) as GeneratedCartoon;
  } catch (err) {
    console.error("cartoon generate: writing step failed:", err);
    return NextResponse.json({ error: "Failed to write the cartoon." }, { status: 502 });
  }

  try {
    const { buffer, mimeType } = await generateAiImage(buildImagenPrompt(generated.scene), "4:3");
    const watermarked = await watermarkCartoon(buffer, mimeType);
    const image_url = await uploadBufferToNewsMedia(watermarked, "png", "image/png", "cartoons");

    return NextResponse.json({
      title: generated.title,
      caption: generated.caption,
      image_url,
    });
  } catch (err) {
    console.error("cartoon generate: image step failed:", err);
    const message = err instanceof Error ? err.message : "Image generation failed";
    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ error: "Image generation failed." }, { status: 502 });
  }
}
