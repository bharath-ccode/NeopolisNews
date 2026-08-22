// Shared by watermarkCartoon.tsx (draft-time corner mark) and
// bakeCartoonText.tsx (publish-time title/caption bake) — both render via
// next/og and need the same font-loading and logo-fetching plumbing.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";
const LOGO_URL = `${SITE_URL}/logo_transbg.png`;

export async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch ${res.status}`);
  return res.arrayBuffer();
}

// Fetched over HTTP rather than read from public/ via fs — Vercel's
// serverless file tracing doesn't reliably bundle static assets for runtime
// fs access, but the site's own CDN-served copy always works, same as the
// font fetch above.
let cachedLogoDataUrl: string | null = null;
export async function getLogoDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  const res = await fetch(LOGO_URL);
  if (!res.ok) throw new Error(`logo fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  cachedLogoDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  return cachedLogoDataUrl;
}
