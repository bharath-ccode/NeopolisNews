import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getLogoDataUrl } from "@/lib/cartoonAssets";

// 1in x 1in at 96 CSS px/in — the standard digital-pixel definition of an
// inch, since this only ever displays on screens.
const LOGO_SIZE = 96;

/** Stamps just the NeopolisNews logo into the bottom-right corner of a
 *  cartoon image, so it still reads as ours wherever it's shared or
 *  screenshotted — applied to every cartoon, AI-generated or manually
 *  uploaded, at generation time (so it's already there in the draft
 *  preview). Deliberately lightweight — the full "https://neopolis.news"
 *  URL lives in the publish-time caption strip (bakeCartoonText.tsx).
 *  Renders via next/og (same tooling as the headline card) rather than
 *  sharp's SVG-text compositing, since Vercel's serverless runtime has no
 *  guaranteed system fonts for raw SVG text. sharp is only used here to
 *  read the source image's pixel dimensions. */
export async function watermarkCartoon(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 900;

  const logoDataUrl = await getLogoDataUrl();
  const baseDataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

  const margin = Math.round(width * 0.025);
  const pad = Math.round(LOGO_SIZE * 0.18);

  const image = new ImageResponse(
    (
      <div style={{ width, height, display: "flex", position: "relative" }}>
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
            background: "rgba(0,0,0,0.5)",
            borderRadius: 999,
            padding: pad,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUrl} width={LOGO_SIZE} height={LOGO_SIZE} style={{ borderRadius: "50%" }} />
        </div>
      </div>
    ),
    { width, height }
  );

  return Buffer.from(await image.arrayBuffer());
}
