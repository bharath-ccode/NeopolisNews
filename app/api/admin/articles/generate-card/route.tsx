import { NextRequest, NextResponse } from "next/server";
import { generateHeadlineCard } from "@/lib/generateHeadlineCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { title, tag } — render a branded NeopolisNews headline card,
 *  store it in the news-media bucket, and return its public URL. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { title?: string; tag?: string }
    | null;
  const title = body?.title?.trim();
  const tag = body?.tag?.trim() || "News";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const url = await generateHeadlineCard(title, tag);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("generate-card:", err);
    return NextResponse.json({ error: "Card generation failed" }, { status: 502 });
  }
}
