import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Google Imagen via the Gemini API. Requires GOOGLE_AI_API_KEY with the
// Generative Language API enabled and billing on (Imagen is a paid model).
const IMAGEN_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";

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
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_AI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { title?: string; excerpt?: string }
    | null;
  const title = body?.title?.trim();
  const excerpt = body?.excerpt?.trim() ?? "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${IMAGEN_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        instances: [{ prompt: buildPrompt(title, excerpt) }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
          personGeneration: "dont_allow",
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("imagen error:", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "Image generation failed" }, { status: 502 });
    }

    const json = (await res.json()) as {
      predictions?: { bytesBase64Encoded?: string; mimeType?: string }[];
    };
    const b64 = json.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) {
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    const buffer = Buffer.from(b64, "base64");
    const url = await uploadBufferToNewsMedia(buffer, "png", "image/png", "ai");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("generate-image:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: 502 });
  }
}
