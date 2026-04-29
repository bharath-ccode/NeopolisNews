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
  ];

  let dynamic_pages: MetadataRoute.Sitemap = [];

  try {
    const admin = createAdminClient();
    const [{ data: articles }, { data: businesses }, { data: projects }] =
      await Promise.all([
        admin.from("articles").select("id, updated_at").eq("status", "published"),
        admin.from("businesses").select("id, completed_at").eq("status", "active"),
        admin.from("projects").select("id, updated_at"),
      ]);

    dynamic_pages = [
      ...(articles   ?? []).map((a) => ({ url: `${BASE}/news/${a.id}`,         lastModified: a.updated_at   ?? undefined, changeFrequency: "monthly" as const, priority: 0.7 })),
      ...(businesses ?? []).map((b) => ({ url: `${BASE}/businesses/${b.id}`,   lastModified: b.completed_at ?? undefined, changeFrequency: "weekly"  as const, priority: 0.6 })),
      ...(projects   ?? []).map((p) => ({ url: `${BASE}/real-estate/${p.id}`,  lastModified: p.updated_at   ?? undefined, changeFrequency: "weekly"  as const, priority: 0.7 })),
    ];
  } catch {
    // serve static-only sitemap on error
  }

  return [...static_pages, ...dynamic_pages];
}
