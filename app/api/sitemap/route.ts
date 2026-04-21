import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

function url(path: string, lastmod?: string, freq?: string, priority?: string) {
  return `  <url>
    <loc>${BASE}${path}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${freq ? `\n    <changefreq>${freq}</changefreq>` : ""}${priority ? `\n    <priority>${priority}</priority>` : ""}
  </url>`;
}

export async function GET() {
  const staticUrls = [
    url("/",                        undefined, "daily",   "1.0"),
    url("/news",                    undefined, "daily",   "0.9"),
    url("/real-estate",             undefined, "weekly",  "0.8"),
    url("/real-estate/classifieds", undefined, "daily",   "0.8"),
    url("/directory",               undefined, "weekly",  "0.7"),
    url("/rentals",                 undefined, "weekly",  "0.7"),
    url("/services",                undefined, "monthly", "0.5"),
    url("/advertise",               undefined, "monthly", "0.4"),
    url("/privacy",                 undefined, "yearly",  "0.2"),
    url("/terms",                   undefined, "yearly",  "0.2"),
    url("/cookies",                 undefined, "yearly",  "0.2"),
  ];

  let dynamicUrls: string[] = [];

  try {
    const admin = createAdminClient();
    const [{ data: articles }, { data: businesses }, { data: projects }] =
      await Promise.all([
        admin.from("articles").select("id, updated_at").eq("status", "published").order("created_at", { ascending: false }),
        admin.from("businesses").select("id, completed_at").eq("status", "active"),
        admin.from("projects").select("id, updated_at"),
      ]);

    dynamicUrls = [
      ...(articles  ?? []).map((a) => url(`/news/${a.id}`,          a.updated_at?.slice(0, 10),  "monthly", "0.7")),
      ...(businesses ?? []).map((b) => url(`/businesses/${b.id}`,   b.completed_at?.slice(0, 10), "weekly",  "0.6")),
      ...(projects  ?? []).map((p) => url(`/real-estate/${p.id}`,   p.updated_at?.slice(0, 10),  "weekly",  "0.7")),
    ];
  } catch {
    // fall through — serve static-only sitemap
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...dynamicUrls].join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
