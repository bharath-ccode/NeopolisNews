import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FONT_BOLD = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-800-normal.woff";
const FONT_MED = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-500-normal.woff";

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch ${res.status}`);
  return res.arrayBuffer();
}

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

  // Scale title down as it gets longer so it always fits the card.
  const titleSize = title.length > 120 ? 52 : title.length > 80 ? 60 : title.length > 48 ? 72 : 84;

  try {
    const [bold, medium] = await Promise.all([loadFont(FONT_BOLD), loadFont(FONT_MED)]);

    const image = new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px",
            background: "linear-gradient(135deg, #09243f 0%, #0d3a6e 55%, #054fa1 100%)",
            fontFamily: "Inter",
          }}
        >
          {/* Top: category chip */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 500,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#09243f",
                background: "#f97316",
                padding: "10px 24px",
                borderRadius: 999,
              }}
            >
              {tag}
            </div>
          </div>

          {/* Middle: headline */}
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.12,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            {title}
          </div>

          {/* Bottom: wordmark */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: "#ffffff" }}>Neopolis</span>
              <span style={{ fontSize: 40, fontWeight: 800, color: "#3aa0f8" }}>News</span>
            </div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: "#7ec2fc" }}>
              Kokapet · Narsingi · Hyderabad
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Inter", data: bold, weight: 800, style: "normal" },
          { name: "Inter", data: medium, weight: 500, style: "normal" },
        ],
      }
    );

    const buffer = Buffer.from(await image.arrayBuffer());
    const url = await uploadBufferToNewsMedia(buffer, "png", "image/png", "cards");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("generate-card:", err);
    return NextResponse.json({ error: "Card generation failed" }, { status: 502 });
  }
}
