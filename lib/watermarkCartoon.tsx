import { ImageResponse } from "next/og";
import sharp from "sharp";
import { loadFont, getLogoDataUrl } from "@/lib/cartoonAssets";

const FONT_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff";

/** Stamps the NeopolisNews logo + site URL into the bottom-right corner of a
 *  cartoon image, so it still reads as ours wherever it's shared or
 *  screenshotted — applied to every cartoon, AI-generated or manually
 *  uploaded, at generation time (so it's already there in the draft
 *  preview). Deliberately lightweight — the more prominent logo + full URL
 *  lockup lives in the publish-time caption strip (bakeCartoonText.tsx).
 *  Renders via next/og (same tooling as the headline card) rather than
 *  sharp's SVG-text compositing, since Vercel's serverless runtime has no
 *  guaranteed system fonts for raw SVG text. sharp is only used here to
 *  read the source image's pixel dimensions. */
export async function watermarkCartoon(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 900;

  const [font, logoDataUrl] = await Promise.all([loadFont(FONT_URL), getLogoDataUrl()]);
  const baseDataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

  const logoSize = Math.round(height * 0.1);
  const fontSize = Math.round(logoSize * 0.36);
  const margin = Math.round(width * 0.025);

  const image = new ImageResponse(
    (
      <div style={{ width, height, display: "flex", position: "relative", fontFamily: "Inter" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={baseDataUrl}
          width={width}
          height={height}
          style={{ objectFit: "cover", position: "absolute", top: 0, left: 0 }}
        />
        <div
          style={{
            position: "absolute",
            right: margin,
            bottom: margin,
            display: "flex",
            alignItems: "center",
            gap: Math.round(fontSize * 0.4),
            background: "rgba(0,0,0,0.5)",
            borderRadius: 999,
            padding: `${Math.round(fontSize * 0.4)}px ${Math.round(fontSize * 0.9)}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUrl} width={logoSize} height={logoSize} style={{ borderRadius: "50%" }} />
          <span style={{ fontSize, fontWeight: 700, color: "#ffffff" }}>neopolis.news</span>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [{ name: "Inter", data: font, weight: 700, style: "normal" }],
    }
  );

  return Buffer.from(await image.arrayBuffer());
}
