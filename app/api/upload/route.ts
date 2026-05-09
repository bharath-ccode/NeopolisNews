import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import sharp from "sharp";

const ALLOWED_BUCKETS = ["business-media", "news-media"] as const;
type Bucket = typeof ALLOWED_BUCKETS[number];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB pre-compression
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 82;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "misc";
    const bucketParam = (formData.get("bucket") as string) || "business-media";
    const bucket: Bucket = (ALLOWED_BUCKETS as readonly string[]).includes(bucketParam)
      ? (bucketParam as Bucket)
      : "business-media";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP and GIF images are allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB" },
        { status: 400 }
      );
    }

    const raw = Buffer.from(await file.arrayBuffer());

    // GIFs are left as-is (sharp drops animation); everything else → WebP
    const isGif = file.type === "image/gif";
    let compressed: Buffer;
    let contentType: string;
    let ext: string;

    if (isGif) {
      compressed = raw;
      contentType = "image/gif";
      ext = "gif";
    } else {
      compressed = await sharp(raw)
        .rotate()
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      contentType = "image/webp";
      ext = "webp";
    }

    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, compressed, { contentType, upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
