import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ALL_AMENITIES } from "@/lib/amenitiesData";

export const maxDuration = 60;

const EXTRACTION_PROMPT = `
You are extracting structured data from a real estate project brochure PDF.

Return ONLY a valid JSON object — no markdown fences, no explanation, just raw JSON.

Extract these fields (omit any field you cannot confidently identify):

{
  "projectName": string,
  "projectType": "apartments" | "independent_homes" | "residential" | "mixed_use" | "commercial",
  "tier": "affordable" | "premium" | "luxury" | "uber_luxury",
  "lifecycleStatus": "pre_launch" | "rera_registered" | "under_construction" | "structure_complete" | "finishing" | "oc_received" | "ready_to_move",
  "totalLandAreaAcres": number,
  "totalUnits": number,
  "priceRangeMin": number,
  "priceRangeMax": number,
  "maxFloors": number,
  "amenitiesSqft": number,
  "reraNumber": string,
  "contact": {
    "email": string,
    "phone": string,
    "website": string,
    "projectOwner": string
  },
  "towers": [
    { "towerName": string, "numFloors": number }
  ],
  "unitPlans": [
    {
      "planName": string,
      "bhk": number,
      "sizeSqft": number,
      "facing": "North" | "South" | "East" | "West" | "North-East" | "North-West" | "South-East" | "South-West",
      "maidRoom": boolean,
      "homeOffice": boolean
    }
  ],
  "amenities": string[]
}

Rules:
- priceRangeMin / priceRangeMax: price PER SQUARE FOOT in INR (e.g. ₹12,000/sft → 12000). If only one price is shown, use it for both.
- phone: E.164 format — e.g. "+918399939999". Strip spaces and dashes.
- lifecycleStatus: infer from context ("Under Construction" → under_construction, "Ready to Move" → ready_to_move, "Pre Launch" → pre_launch).
- tier: infer from context ("Luxury" / "Ultra Luxury" → luxury or uber_luxury, "Affordable" → affordable, otherwise → premium).
- towers: only list explicit tower names/counts. If the brochure says "2 towers" without naming them, return [{"towerName":"Tower 1","numFloors":N},{"towerName":"Tower 2","numFloors":N}].
- unitPlans: one entry per distinct configuration. Do NOT duplicate plans with the same size and BHK just for different facings — instead, create one entry per unique (BHK, sizeSqft) pair and pick the most prominent facing.
- amenities: ONLY select items from this exact list that appear in the brochure:
${ALL_AMENITIES.map((a) => `  "${a}"`).join(",\n")}
`.trim();

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

  const client = new Anthropic({ apiKey });

  let rawText = "";
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "url", url: pdfUrl },
            },
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
    return NextResponse.json({ error: "AI extraction failed. Check your ANTHROPIC_API_KEY." }, { status: 502 });
  }

  // Strip markdown code fences if Claude added them
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(cleaned);
  } catch {
    console.error("Claude returned non-JSON:", rawText);
    return NextResponse.json({ error: "AI returned unexpected format." }, { status: 502 });
  }

  // Normalize amenities: keep only items that are in our master list
  if (Array.isArray(data.amenities)) {
    data.amenities = (data.amenities as string[]).filter((a) => ALL_AMENITIES.includes(a));
  } else {
    data.amenities = [];
  }

  return NextResponse.json(data);
}
