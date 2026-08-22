import { ImageResponse } from "next/og";
import sharp from "sharp";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";
import { loadFont, getLogoDataUrl } from "@/lib/cartoonAssets";

const FONT_BOLD_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-800-normal.woff";
const FONT_MED_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-500-normal.woff";
const FONT_MED_ITALIC_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-500-italic.woff";
const FONT_BOLD700_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff";

/** Bakes the title (banner over the art) and punchline caption (a white
 *  strip added below the art, like a printed single-panel cartoon caption)
 *  onto a cartoon image — buffer in, buffer out, same shape as
 *  watermarkCartoon. The white strip also carries the definitive logo +
 *  full-URL lockup, bottom-right — a second, more prominent mark than the
 *  lightweight one watermarkCartoon already baked onto the art itself. */
export async function bakeCartoonText(
  imageBuffer: Buffer,
  mimeType: string,
  title: string,
  caption: string | null
): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const artWidth = meta.width ?? 1200;
  const artHeight = meta.height ?? 900;
  const stripHeight = Math.round(artWidth * 0.16);
  const totalHeight = artHeight + stripHeight;

  const [bold, medium, mediumItalic, bold700, logoDataUrl] = await Promise.all([
    loadFont(FONT_BOLD_URL),
    loadFont(FONT_MED_URL),
    loadFont(FONT_MED_ITALIC_URL).catch(() => loadFont(FONT_MED_URL)), // italic file may not exist for every weight
    loadFont(FONT_BOLD700_URL),
    getLogoDataUrl(),
  ]);
  const baseDataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

  const titleSize = Math.round(artHeight * (title.length > 40 ? 0.05 : 0.065));
  const padX = Math.round(artWidth * 0.04);

  const captionSize = Math.round(stripHeight * 0.2);
  const markSize = Math.round(stripHeight * 0.36);
  const urlSize = Math.round(stripHeight * 0.13);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: artWidth,
          height: totalHeight,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter",
        }}
      >
        {/* Art region: illustration + title banner, unchanged from before */}
        <div style={{ width: artWidth, height: artHeight, display: "flex", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={baseDataUrl}
            width={artWidth}
            height={artHeight}
            style={{ objectFit: "cover", position: "absolute", top: 0, left: 0 }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "flex-start",
              padding: `${Math.round(titleSize * 0.6)}px ${padX}px`,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0))",
            }}
          >
            <span style={{ fontSize: titleSize, fontWeight: 800, color: "#ffffff", lineHeight: 1.15 }}>
              {title}
            </span>
          </div>
        </div>

        {/* Caption strip: printed below the panel, like a real single-panel
            gag cartoon — solid white so it reads the same regardless of the
            art's palette that day. */}
        <div
          style={{
            width: artWidth,
            height: stripHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: Math.round(padX * 0.6),
            padding: `0 ${padX}px`,
            background: "#ffffff",
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: captionSize,
              fontStyle: caption ? "italic" : "normal",
              fontWeight: 500,
              color: "#16283b",
              lineHeight: 1.3,
            }}
          >
            {caption ? `“${caption}”` : ""}
          </span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDataUrl} width={markSize} height={markSize} style={{ borderRadius: "50%" }} />
            <span
              style={{
                marginTop: Math.round(urlSize * 0.3),
                fontSize: urlSize,
                fontWeight: 700,
                color: "#0d3a6e",
                whiteSpace: "nowrap",
              }}
            >
              https://neopolis.news
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: artWidth,
      height: totalHeight,
      fonts: [
        { name: "Inter", data: bold, weight: 800, style: "normal" },
        { name: "Inter", data: medium, weight: 500, style: "normal" },
        { name: "Inter", data: mediumItalic, weight: 500, style: "italic" },
        { name: "Inter", data: bold700, weight: 700, style: "normal" },
      ],
    }
  );

  return Buffer.from(await image.arrayBuffer());
}

/** Fetches a cartoon's clean artwork, bakes in the title/caption strip,
 *  uploads the result, and returns its URL — the orchestration used at the
 *  moment a cartoon is published (both the create-and-publish and the
 *  publish-an-existing-draft paths). */
export async function bakePublishedCartoonImage(
  artworkUrl: string,
  title: string,
  caption: string | null
): Promise<string> {
  const res = await fetch(artworkUrl);
  if (!res.ok) throw new Error(`artwork fetch ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type") || "image/png";

  const baked = await bakeCartoonText(buffer, mimeType, title, caption);
  return uploadBufferToNewsMedia(baked, "png", "image/png", "cartoons");
}
