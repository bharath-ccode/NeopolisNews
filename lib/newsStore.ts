import { createClient } from "@/lib/supabase/client";

export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0] || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/");
      const idx = parts.findIndex(p => p === "embed" || p === "shorts" || p === "v");
      if (idx !== -1) return parts[idx + 1] || null;
    }
  } catch { /* invalid URL */ }
  return null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ArticleCategory = "construction" | "launches" | "infrastructure" | "community" | "editorial" | "digest";
export type ArticleStatus = "draft" | "published";
export type TagColor = "tag-orange" | "tag-green" | "tag-blue" | "tag-purple" | "tag-slate";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  tag: string;
  tagColor: TagColor;
  author: string;
  date: string;
  readTime: string;
  views: number;
  sponsored: boolean;
  status: ArticleStatus;
  imageUrl?: string;
  videoUrl?: string | null;
  source?: string | null;
  projectId?: string | null;
  builderId?: string | null;
  digestLevel?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_META: Record<
  ArticleCategory,
  { label: string; tag: string; tagColor: TagColor }
> = {
  construction:   { label: "Construction",   tag: "Construction",  tagColor: "tag-orange" },
  launches:       { label: "Business Launches", tag: "Business Launch", tagColor: "tag-green"  },
  infrastructure: { label: "Infrastructure", tag: "Infrastructure",tagColor: "tag-blue"   },
  community:      { label: "Community",      tag: "Community",     tagColor: "tag-purple" },
  editorial:      { label: "Editorial",      tag: "Editorial",     tagColor: "tag-slate"  },
  // Daily AI digests — identity lives in digest_level (international/national/
  // state/city); the article keeps its level tag (World/India/Telangana/Hyderabad).
  digest:         { label: "Daily Digest",   tag: "Daily Digest",  tagColor: "tag-blue"   },
};

const DIGEST_LEVEL_PREFIX: Record<string, string> = {
  international: "International",
  national:      "National",
  state:         "Telangana",
  city:          "Hyderabad",
};

/** "International" / "National" / "Telangana" / "Hyderabad" / "Editorial" /
 *  etc. — the short label shown as a "Category: Headline" prefix on
 *  headline listings (e.g. the homepage's Latest News index). Digest
 *  articles resolve via digest_level rather than the generic "Daily
 *  Digest" category label, since the level is the meaningful distinction
 *  for readers. */
export function getHeadlinePrefix(category: ArticleCategory, digestLevel?: string | null): string {
  if (category === "digest") {
    return (digestLevel && DIGEST_LEVEL_PREFIX[digestLevel]) || CATEGORY_META.digest.label;
  }
  return CATEGORY_META[category]?.label ?? "";
}

// ─── Row mapper: Supabase snake_case → Article camelCase ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toArticle(row: any): Article {
  return {
    id:        row.id,
    title:     row.title,
    excerpt:   row.excerpt,
    content:   row.content,
    category:  row.category,
    tag:       row.tag,
    tagColor:  row.tag_color,
    author:    row.author,
    date:      row.date,
    readTime:  row.read_time,
    views:     row.views,
    sponsored: row.sponsored,
    status:    row.status,
    imageUrl:  row.image_url ?? undefined,
    videoUrl:  row.video_url ?? null,
    source:    row.source ?? null,
    projectId: row.project_id ?? null,
    builderId: row.builder_id ?? null,
    digestLevel: row.digest_level ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getArticles(): Promise<Article[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { console.error("getArticles:", error.message); return []; }
  return (data ?? []).map(toArticle);
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return toArticle(data);
}

export async function createArticle(
  payload: Omit<Article, "id" | "createdAt" | "updatedAt">
): Promise<Article> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("articles")
    .insert({
      title:      payload.title,
      excerpt:    payload.excerpt,
      content:    payload.content,
      category:   payload.category,
      tag:        payload.tag,
      tag_color:  payload.tagColor,
      author:     payload.author,
      date:       payload.date,
      read_time:  payload.readTime,
      views:      payload.views,
      sponsored:  payload.sponsored,
      status:     payload.status,
      image_url:  payload.imageUrl ?? null,
      video_url:  payload.videoUrl ?? null,
      source:     payload.source ?? null,
      project_id: payload.projectId ?? null,
      builder_id: payload.builderId ?? null,
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create article");
  return toArticle(data);
}

export async function updateArticle(
  id: string,
  payload: Partial<Omit<Article, "id" | "createdAt">>
): Promise<Article | null> {
  const supabase = createClient();

  const patch: Record<string, unknown> = {};
  if (payload.title     !== undefined) patch.title      = payload.title;
  if (payload.excerpt   !== undefined) patch.excerpt    = payload.excerpt;
  if (payload.content   !== undefined) patch.content    = payload.content;
  if (payload.category  !== undefined) patch.category   = payload.category;
  if (payload.tag       !== undefined) patch.tag        = payload.tag;
  if (payload.tagColor  !== undefined) patch.tag_color  = payload.tagColor;
  if (payload.author    !== undefined) patch.author     = payload.author;
  if (payload.date      !== undefined) patch.date       = payload.date;
  if (payload.readTime  !== undefined) patch.read_time  = payload.readTime;
  if (payload.views     !== undefined) patch.views      = payload.views;
  if (payload.sponsored !== undefined) patch.sponsored  = payload.sponsored;
  if (payload.status    !== undefined) patch.status     = payload.status;
  if (payload.imageUrl  !== undefined) patch.image_url  = payload.imageUrl ?? null;
  if (payload.videoUrl  !== undefined) patch.video_url  = payload.videoUrl ?? null;
  if (payload.source    !== undefined) patch.source     = payload.source ?? null;
  if (payload.projectId !== undefined) patch.project_id = payload.projectId ?? null;
  if (payload.builderId !== undefined) patch.builder_id = payload.builderId ?? null;

  const { data, error } = await supabase
    .from("articles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return toArticle(data);
}

export async function deleteArticle(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  return !error;
}

export async function getPublishedArticlesByCategory(category: ArticleCategory): Promise<Article[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("category", category)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) { console.error("getPublishedArticlesByCategory:", error.message); return []; }
  return (data ?? []).map(toArticle);
}

export async function getPublishedArticles(): Promise<Article[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) { console.error("getPublishedArticles:", error.message); return []; }
  return (data ?? []).map(toArticle);
}

export async function getArticlesByBuilderId(builderId: string): Promise<Article[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("builder_id", builderId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getArticlesByBuilderId:", error.message); return []; }
  return (data ?? []).map(toArticle);
}

export async function getArticleStats() {
  const articles = await getArticles();
  return {
    total:      articles.length,
    published:  articles.filter((a) => a.status === "published").length,
    drafts:     articles.filter((a) => a.status === "draft").length,
    sponsored:  articles.filter((a) => a.sponsored).length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
  };
}

