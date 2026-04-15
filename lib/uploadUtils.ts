import { createClient } from "@/lib/supabase/client";

const BUCKET = "builder-assets";

export async function uploadImage(file: File, folder: string): Promise<string> {
  const sb = createClient();

  // Check auth session
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error("Not authenticated. Please log in again.");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(`Storage error: ${error.message}`);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const sb = createClient();
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await sb.storage.from(BUCKET).remove([path]);
}
