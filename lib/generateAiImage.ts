// Google's Gemini native image-generation model — replaced the old Imagen 3/4
// `:predict` endpoints, which Google deprecated/shut down on Aug 17, 2026.
// Shared by the editorial-illustration and cartoon generators: each builds
// its own prompt, this handles the call, the response shape, and errors.
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`;

export interface GeneratedImage {
  buffer: Buffer;
  mimeType: string;
}

export async function generateAiImage(
  prompt: string,
  aspectRatio: "16:9" | "4:3" | "1:1" = "16:9"
): Promise<GeneratedImage> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not configured");

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Image generation failed: ${res.status} ${detail.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
  };
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  const inline = part?.inlineData;
  if (!inline?.data) throw new Error("No image returned");

  return { buffer: Buffer.from(inline.data, "base64"), mimeType: inline.mimeType || "image/png" };
}
