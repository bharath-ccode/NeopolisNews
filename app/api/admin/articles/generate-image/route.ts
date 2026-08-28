import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";
import { generateAiImage } from "@/lib/generateAiImage";
import { stripHtml } from "@/lib/digestSources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new Anthropic();

/** Briefs Claude on the full article to get one concrete, specific scene to
 *  illustrate — same two-step idea as the cartoon generator (write a scene,
 *  then illustrate it) rather than handing Gemini just the title/excerpt,
 *  which is what produced generic, abstract "stock illustration" covers. */
async function writeScene(title: string, excerpt: string, content: string): Promise<string> {
  const bodyText = stripHtml(content).slice(0, 4000);
  const prompt = `You brief an editorial illustrator for NeopolisNews, a Hyderabad business and real-estate news site. Read this article and describe ONE concrete, specific scene that captures its actual substance — grounded in the real details, people's roles, setting, and mood of the piece. Not a generic abstract concept.

Title: ${title}
${excerpt ? `Excerpt: ${excerpt}\n` : ""}
Article:
${bodyText}

Write one vivid paragraph (3-5 sentences) describing exactly what the illustration should depict: the setting, the human activity or focal subject, telling visual details drawn from the article, and the mood. Be specific and concrete, not abstract or symbolic. Do not name any real individuals — describe generic figures by role (e.g. "a site engineer", "two commuters") instead of names. Respond with ONLY the scene description — no preamble, no labels, no quotes.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });
  return (message.content[0] as { type: string; text: string }).text.trim();
}

/** Deliberately illustrative, never photo-realistic — these run on opinion/
 *  editorial pieces, so the image must read as commentary art, not a photo of
 *  a real event, place, or person. */
function buildImagenPrompt(scene: string): string {
  return [
    "Sophisticated editorial illustration for a business and real-estate news publication, in the tradition of a New York Times Opinion or Economist cover illustration.",
    `Scene: ${scene}`,
    "Style: a specific, grounded illustrated scene with a clear focal subject and real visual interest — rich but tasteful colour palette, confident composition, a touch of visual metaphor woven into the concrete setting rather than pure abstraction. Richly rendered digital illustration, not flat corporate iconography or generic geometric shapes.",
    "Strictly no text, no words, no letters, no numbers, no logos, no signage.",
    "Do NOT depict real, named, or recognisable individuals, real landmarks, or brand marks — generic figures only. Not a photograph.",
  ].join(" ");
}

/** POST { title, excerpt?, content? } — brief Claude on the article to get a
 *  concrete scene, illustrate it with Gemini, store it in the news-media
 *  bucket, and return its public URL. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { title?: string; excerpt?: string; content?: string }
    | null;
  const title = body?.title?.trim();
  const excerpt = body?.excerpt?.trim() ?? "";
  const content = body?.content?.trim() ?? "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  let scene: string;
  try {
    scene = content ? await writeScene(title, excerpt, content) : [title, excerpt].filter(Boolean).join(" — ");
  } catch (err) {
    console.error("generate-image: scene writing failed:", err);
    scene = [title, excerpt].filter(Boolean).join(" — "); // best-effort fallback, don't block the illustration
  }

  try {
    const { buffer, mimeType } = await generateAiImage(buildImagenPrompt(scene), "16:9");
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const url = await uploadBufferToNewsMedia(buffer, ext, mimeType, "ai");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("generate-image:", err);
    const message = err instanceof Error ? err.message : "Image generation failed";
    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ error: "Image generation failed" }, { status: 502 });
  }
}
