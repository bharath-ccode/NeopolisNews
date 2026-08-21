import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchHeadlines } from "@/lib/digestSources";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new Anthropic();

// Google Imagen via the Gemini API — same model the editorial-illustration
// generator uses. Requires GOOGLE_AI_API_KEY with billing on.
const IMAGEN_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";

interface GeneratedCartoon {
  title: string;
  caption: string;
  scene: string;
}

function buildTextPrompt(headlineText: string, feedback?: string): string {
  return `You write "Today in Neopolis," a daily single-panel gag cartoon about life in Kokapet/Narsingi, a fast-growing IT-corridor suburb of Hyderabad under heavy construction — new towers, traffic, real-estate launches, tech professionals commuting.

Today's local Hyderabad headlines:
${headlineText}
${feedback ? `\nThe editor wants this take instead: ${feedback}` : ""}

Pick ONE headline (or a general Neopolis-life theme if none suit a cartoon) and write a gentle, witty gag cartoon about it — observational humor, not mean-spirited, that a Hyderabad tech professional would smile at.

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

/** POST { feedback? } — pick a local headline, write a title/caption/scene
 *  with Claude, illustrate it with Imagen, and return a ready-to-review
 *  draft (title, caption, image_url) for the admin form. Nothing is saved
 *  until the admin hits Publish/Save draft. */
export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_AI_API_KEY is not configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { feedback?: string };
  const feedback = body.feedback?.trim() || undefined;

  const headlines = await fetchHeadlines("city");
  if (headlines.length === 0) {
    return NextResponse.json(
      { error: "No headlines available right now — try again shortly." },
      { status: 502 }
    );
  }
  const headlineText = headlines
    .map((h, i) => `${i + 1}. [${h.source}] ${h.title}${h.description ? ` — ${h.description}` : ""}`)
    .join("\n");

  let generated: GeneratedCartoon;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: buildTextPrompt(headlineText, feedback) }],
    });
    const text = (message.content[0] as { type: string; text: string }).text.trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    generated = JSON.parse(cleaned) as GeneratedCartoon;
  } catch (err) {
    console.error("cartoon generate: writing step failed:", err);
    return NextResponse.json({ error: "Failed to write the cartoon." }, { status: 502 });
  }

  try {
    const res = await fetch(`${IMAGEN_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        instances: [{ prompt: buildImagenPrompt(generated.scene) }],
        parameters: { sampleCount: 1, aspectRatio: "4:3", personGeneration: "allow_adult" },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("cartoon generate: imagen error:", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "Image generation failed." }, { status: 502 });
    }

    const json = (await res.json()) as { predictions?: { bytesBase64Encoded?: string }[] };
    const b64 = json.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return NextResponse.json({ error: "No image returned." }, { status: 502 });

    const buffer = Buffer.from(b64, "base64");
    const image_url = await uploadBufferToNewsMedia(buffer, "png", "image/png", "cartoons");

    return NextResponse.json({
      title: generated.title,
      caption: generated.caption,
      image_url,
    });
  } catch (err) {
    console.error("cartoon generate: image step failed:", err);
    return NextResponse.json({ error: "Image generation failed." }, { status: 502 });
  }
}
