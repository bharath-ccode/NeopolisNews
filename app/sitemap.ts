import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_pages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                        priority: 1.0, changeFrequency: "daily"   },
    { url: `${BASE}/news`,                    priority: 0.9, changeFrequency: "daily"   },
    { url: `${BASE}/real-estate`,             priority: 0.9, changeFrequency: "weekly"  },
    { url: `${BASE}/businesses`,              priority: 0.8, changeFrequency: "weekly"  },
    { url: `${BASE}/health`,                  priority: 0.8, changeFrequency: "weekly"  },
    { url: `${BASE}/health/wellness`,         priority: 0.7, changeFrequency: "weekly"  },
    { url: `${BASE}/deals`,                   priority: 0.8, changeFrequency: "daily"   },
    { url: `${BASE}/entertainment/cinemas`,   priority: 0.7, changeFrequency: "daily"   },
    { url: `${BASE}/events`,                  priority: 0.7, changeFrequency: "weekly"  },
    { url: `${BASE}/forum`,                   priority: 0.7, changeFrequency: "daily"   },
    { url: `${BASE}/clubs`,                   priority: 0.8, changeFrequency: "weekly"  },
    { url: `${BASE}/cartoon`,                 priority: 0.8, changeFrequency: "daily"   },
    { url: `${BASE}/leaderboard`,             priority: 0.6, changeFrequency: "daily"   },
    { url: `${BASE}/classifieds`,             priority: 0.7, changeFrequency: "daily"   },
    { url: `${BASE}/rentals`,                 priority: 0.7, changeFrequency: "weekly"  },
    { url: `${BASE}/education`,               priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/services`,                priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/announcements`,           priority: 0.6, changeFrequency: "daily"   },
    { url: `${BASE}/search`,                  priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/advertise`,               priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/directory`,               priority: 0.6, changeFrequency: "weekly"  },
    { url: `${BASE}/privacy`,                 priority: 0.2, changeFrequency: "yearly"  },
    { url: `${BASE}/terms`,                   priority: 0.2, changeFrequency: "yearly"  },
    { url: `${BASE}/support`,                 priority: 0.2, changeFrequency: "yearly"  },
  ];

  let dynamic_pages: MetadataRoute.Sitemap = [];

  try {
    const admin = createAdminClient();
    const [
      { data: articles }, { data: businesses }, { data: projects },
      { data: clubs }, { data: threads }, { data: translations },
    ] = await Promise.all([
      admin.from("articles").select("id, updated_at").eq("status", "published"),
      admin.from("businesses").select("id, completed_at").eq("status", "active"),
      admin.from("projects").select("id, updated_at"),
      admin.from("clubs").select("id, created_at").eq("status", "active"),
      admin
        .from("forum_posts")
        .select("id, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(500),
      admin.from("article_translations").select("article_id, updated_at").eq("lang", "te"),
    ]);

    // Telugu article URLs — only for published articles with a cached translation
    const publishedIds = new Set((articles ?? []).map((a) => a.id));
    const teluguPages = (translations ?? [])
      .filter((t) => publishedIds.has(t.article_id))
      .map((t) => ({
        url: `${BASE}/news/te/${t.article_id}`,
        lastModified: t.updated_at ?? undefined,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));

    dynamic_pages = [
      ...(articles   ?? []).map((a) => ({ url: `${BASE}/news/${a.id}`,         lastModified: a.updated_at   ?? undefined, changeFrequency: "monthly" as const, priority: 0.7 })),
      ...teluguPages,
      ...(businesses ?? []).map((b) => ({ url: `${BASE}/businesses/${b.id}`,   lastModified: b.completed_at ?? undefined, changeFrequency: "weekly"  as const, priority: 0.6 })),
      ...(projects   ?? []).map((p) => ({ url: `${BASE}/real-estate/${p.id}`,  lastModified: p.updated_at   ?? undefined, changeFrequency: "weekly"  as const, priority: 0.7 })),
      ...(clubs      ?? []).map((c) => ({ url: `${BASE}/clubs/${c.id}`,        lastModified: c.created_at   ?? undefined, changeFrequency: "weekly"  as const, priority: 0.6 })),
      ...(threads    ?? []).map((t) => ({ url: `${BASE}/forum/${t.id}`,        lastModified: t.created_at   ?? undefined, changeFrequency: "monthly" as const, priority: 0.5 })),
    ];
  } catch {
    // serve static-only sitemap on error
  }

  return [...static_pages, ...dynamic_pages];
}
