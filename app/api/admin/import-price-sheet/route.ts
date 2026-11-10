import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const BUCKET = "builder-assets";
// Claude's URL document source caps PDFs at 32MB.
const MAX_PDF_BYTES = 32 * 1024 * 1024;

// Mirror an externally-hosted price sheet into our storage so the saved
// link doesn't rot — same approach as /api/admin/import-brochure.
async function persistExternalPdf(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_PDF_BYTES) return null;
    if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") return null;

    const sb = createAdminClient();
    const path = `price-sheets/temp/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
    const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (error) return null;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch {
    return null;
  }
}

const EXTRACTION_PROMPT = `
You are extracting pricing data from a real estate project's price sheet PDF.

Return ONLY a valid JSON object — no markdown fences, no explanation, just raw JSON:

{
  "basePricePerSft": number,
  "charges": { "<charge label as shown on the sheet>": "<value as a short string>" }
}

Rules:
- basePricePerSft: the headline "Base Price" per square foot, numeric only (strip ₹, commas, "/sft", "per sft").
- charges: capture every OTHER line item on the sheet as its own entry — floor rise charges, facing premiums (east/west/corner/etc.), view premiums, amenities/club membership, car parking, legal & documentation, corpus fund, maintenance — using the sheet's own label as the key and the value exactly as stated (e.g. "₹20/sft from 3rd floor onwards", "₹12,00,000/-"). Keep each value short and as-shown; don't normalize units across different line items.
- Do NOT include the payment schedule (installment percentages tied to construction milestones) — that's not a price field.
- If the sheet shows different prices per tower/block for the same charge, pick the most prominent one and note the distinction in the label itself (e.g. "Car Parking — Tower A & C").
`.trim();

/** POST { url } — stateless extraction, same pattern as import-brochure:
 *  the caller (ProjectForm's price sheet tab) decides what to do with the
 *  result — review, edit, then save as a new project_price_history row. */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured." }, { status: 500 });
  }

  let pdfUrl = "";
  try {
    const body = await req.json();
    pdfUrl = body?.url ?? "";
  } catch {
    return NextResponse.json({ error: "Could not parse request body." }, { status: 400 });
  }

  if (!pdfUrl) return NextResponse.json({ error: "No PDF URL provided." }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(pdfUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json({ error: "Only http(s) URLs are supported." }, { status: 400 });
  }

  const isOwnStorage = pdfUrl.includes(".supabase.co/");
  let priceSheetUrl = pdfUrl;
  if (!isOwnStorage) {
    const persisted = await persistExternalPdf(pdfUrl);
    if (persisted) priceSheetUrl = persisted;
  }

  const client = new Anthropic({ apiKey });

  let rawText = "";
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "url", url: priceSheetUrl } },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
    });
    rawText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");
  } catch (err) {
    console.error("Claude API error:", err);
    const hint = isOwnStorage
      ? "AI extraction failed. Check your ANTHROPIC_API_KEY."
      : "AI extraction failed. Make sure the URL is a publicly accessible PDF.";
    return NextResponse.json({ error: hint }, { status: 502 });
  }

  const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let data: { basePricePerSft?: unknown; charges?: unknown };
  try {
    data = JSON.parse(cleaned);
  } catch {
    console.error("Claude returned non-JSON:", rawText);
    return NextResponse.json({ error: "AI returned unexpected format." }, { status: 502 });
  }

  const basePricePerSft = Number(data.basePricePerSft);
  if (!Number.isFinite(basePricePerSft) || basePricePerSft <= 0) {
    return NextResponse.json({ error: "Couldn't find a base price on that sheet." }, { status: 502 });
  }

  const charges: Record<string, string> = {};
  if (data.charges && typeof data.charges === "object") {
    for (const [k, v] of Object.entries(data.charges as Record<string, unknown>)) {
      if (typeof v === "string" || typeof v === "number") charges[k] = String(v);
    }
  }

  return NextResponse.json({ basePricePerSft, charges, priceSheetUrl });
}
