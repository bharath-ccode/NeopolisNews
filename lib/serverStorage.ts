import { createAdminClient } from "@/lib/supabase/server";

const BUCKET = "news-media";

/** Upload a raw buffer to the news-media bucket and return its public URL.
 *  Used by server-side image generators (headline cards, AI illustrations). */
export async function uploadBufferToNewsMedia(
  buffer: Buffer,
  ext: string,
  contentType: string,
  folder = "generated"
): Promise<string> {
  const sb = createAdminClient();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Storage error: ${error.message}`);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
