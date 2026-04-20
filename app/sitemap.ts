import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const [{ data: articles }, { data: businesses }, { data: projects }] =
    await Promise.all([
      admin
        .from("articles")
        .select("id, updated_at")
        .eq("status", "published")
        .order("created_at", { ascending: false }),
      admin
        .from("businesses")
        .select("id, completed_at")
        .eq("status", "active"),
      admin
        .from("projects")
        .select("id, updated_at"),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                       changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/news`,             changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/real-estate`,      changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/real-estate/classifieds`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/directory`,        changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/rentals`,          changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/services`,         changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/advertise`,        changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`,          changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/terms`,            changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/cookies`,          changeFrequency: "yearly",  priority: 0.2 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url:             `${BASE}/news/${a.id}`,
    lastModified:    a.updated_at ? new Date(a.updated_at) : undefined,
    changeFrequency: "monthly",
    priority:        0.7,
  }));

  const businessRoutes: MetadataRoute.Sitemap = (businesses ?? []).map((b) => ({
    url:             `${BASE}/businesses/${b.id}`,
    lastModified:    b.completed_at ? new Date(b.completed_at) : undefined,
    changeFrequency: "weekly",
    priority:        0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = (projects ?? []).map((p) => ({
    url:             `${BASE}/real-estate/${p.id}`,
    lastModified:    p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "weekly",
    priority:        0.7,
  }));

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...businessRoutes,
    ...projectRoutes,
  ];
}
