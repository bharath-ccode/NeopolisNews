import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadBufferToNewsMedia } from "@/lib/serverStorage";
import { watermarkCartoon } from "@/lib/watermarkCartoon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1600;

/** POST multipart { file } — manual cartoon upload, watermarked the same
 *  way as AI-generated cartoons (logo + neopolis.news, bottom-right) so
 *  every cartoon carries it regardless of how it was made. */
export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Maximum size is 5 MB" }, { status: 400 });
  }

  try {
    const raw = Buffer.from(await file.arrayBuffer());
    const resized = await sharp(raw)
      .rotate()
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();

    const watermarked = await watermarkCartoon(resized, "image/png");
    const url = await uploadBufferToNewsMedia(watermarked, "png", "image/png", "cartoons");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("cartoon upload:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
