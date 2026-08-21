import { ImageResponse } from "next/og";
import sharp from "sharp";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";

const FONT_BOLD_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-800-normal.woff";
const FONT_MED_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-500-normal.woff";

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch ${res.status}`);
  return res.arrayBuffer();
}

/** Bakes the title (top banner) and punchline caption (bottom banner)
 *  directly onto a cartoon image — buffer in, buffer out, same shape as
 *  watermarkCartoon. */
export async function bakeCartoonText(
  imageBuffer: Buffer,
  mimeType: string,
  title: string,
  caption: string | null
): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 900;

  const [bold, medium] = await Promise.all([loadFont(FONT_BOLD_URL), loadFont(FONT_MED_URL)]);
  const baseDataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

  const titleSize = Math.round(height * (title.length > 40 ? 0.05 : 0.065));
  const captionSize = Math.round(height * 0.04);
  const padX = Math.round(width * 0.04);

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
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            padding: `${Math.round(titleSize * 0.6)}px ${padX}px`,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0))",
          }}
        >
          <span style={{ fontSize: titleSize, fontWeight: 800, color: "#ffffff", lineHeight: 1.15 }}>
            {title}
          </span>
        </div>

        {caption && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              padding: `${Math.round(captionSize * 0.9)}px ${padX}px`,
              background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
            }}
          >
            <span style={{ fontSize: captionSize, fontWeight: 500, color: "#f1f5f9" }}>
              &ldquo;{caption}&rdquo;
            </span>
          </div>
        )}
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: "Inter", data: bold, weight: 800, style: "normal" },
        { name: "Inter", data: medium, weight: 500, style: "normal" },
      ],
    }
  );

  return Buffer.from(await image.arrayBuffer());
}

/** Fetches a cartoon's clean artwork, bakes in the title/caption, uploads
 *  the result, and returns its URL — the orchestration used at the moment
 *  a cartoon is published (both the create-and-publish and the
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
