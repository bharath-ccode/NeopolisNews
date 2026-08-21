import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";
import { generateAiImage } from "@/lib/generateAiImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Deliberately illustrative, never photo-realistic — these run on opinion/
 *  editorial pieces, so the image must read as commentary art, not a photo of
 *  a real event, place, or person. */
function buildPrompt(title: string, excerpt: string): string {
  return [
    `Editorial illustration for an opinion article titled "${title}".`,
    excerpt ? `Context: ${excerpt}` : "",
    "Style: modern flat editorial illustration, conceptual and abstract, clean vector shapes,",
    "muted professional colour palette, subtle geometric composition, generous negative space.",
    "Strictly no text, no words, no letters, no numbers, no logos, no signage.",
    "Do NOT depict real people, recognisable faces, real landmarks, brand marks,",
    "or realistic photographic scenes. Symbolic and metaphorical only.",
  ]
    .filter(Boolean)
    .join(" ");
}

/** POST { title, excerpt } — generate an AI editorial illustration,
 *  store it in the news-media bucket, and return its public URL. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { title?: string; excerpt?: string }
    | null;
  const title = body?.title?.trim();
  const excerpt = body?.excerpt?.trim() ?? "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const { buffer, mimeType } = await generateAiImage(buildPrompt(title, excerpt), "16:9");
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
