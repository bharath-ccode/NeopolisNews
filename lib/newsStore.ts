import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ArticleCategory = "construction" | "launches" | "infrastructure" | "community";
export type ArticleStatus = "draft" | "published";
export type TagColor = "tag-orange" | "tag-green" | "tag-blue" | "tag-purple";

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
  source?: string | null;
  projectId?: string | null;
  builderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_META: Record<
  ArticleCategory,
  { label: string; tag: string; tagColor: TagColor }
> = {
  construction:   { label: "Construction",   tag: "Construction",  tagColor: "tag-orange" },
  launches:       { label: "New Launches",   tag: "New Launch",    tagColor: "tag-green"  },
  infrastructure: { label: "Infrastructure", tag: "Infrastructure",tagColor: "tag-blue"   },
  community:      { label: "Community",      tag: "Community",     tagColor: "tag-purple" },
};

// ─── Row mapper: Supabase snake_case → Article camelCase ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArticle(row: any): Article {
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
    source:    row.source ?? null,
    projectId: row.project_id ?? null,
    builderId: row.builder_id ?? null,
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
      source:     payload.source ?? null,
      project_id: payload.projectId ?? null,
      builder_id: payload.builderId ?? null,
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

// ─── Analytics mock data (replace with real analytics later) ─────────────────

export interface DailyPageView {
  date: string;
  views: number;
  visitors: number;
}

export function getMockPageViews(days = 14): DailyPageView[] {
  const result: DailyPageView[] = [];
  const base = new Date("2026-03-24");
  // Use a seeded-ish value based on index so it's stable per render
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const seed  = (i * 137 + 42) % 100;
    const views    = 800 + seed * 14;
    const visitors = Math.floor(views * 0.68);
    result.push({ date: label, views, visitors });
  }
  return result;
}

export interface PageStat {
  page: string;
  views: number;
  avgTime: string;
  bounce: string;
}

export const MOCK_PAGE_STATS: PageStat[] = [
  { page: "/",              views: 18420, avgTime: "2m 14s", bounce: "42%" },
  { page: "/news",          views: 12350, avgTime: "3m 08s", bounce: "35%" },
  { page: "/real-estate",   views: 9810,  avgTime: "4m 22s", bounce: "28%" },
  { page: "/rentals",       views: 7640,  avgTime: "3m 51s", bounce: "31%" },
  { page: "/directory",     views: 5230,  avgTime: "2m 40s", bounce: "47%" },
  { page: "/services",      views: 3980,  avgTime: "1m 58s", bounce: "52%" },
  { page: "/advertise",     views: 2810,  avgTime: "2m 02s", bounce: "55%" },
  { page: "/auth/login",    views: 2140,  avgTime: "1m 12s", bounce: "30%" },
  { page: "/auth/register", views: 1820,  avgTime: "3m 45s", bounce: "22%" },
];

export const MOCK_TRAFFIC_SOURCES = [
  { source: "Organic Search", pct: 44, color: "bg-brand-500"  },
  { source: "Direct",         pct: 28, color: "bg-blue-500"   },
  { source: "Social Media",   pct: 16, color: "bg-purple-500" },
  { source: "Referral",       pct: 8,  color: "bg-orange-500" },
  { source: "Other",          pct: 4,  color: "bg-gray-400"   },
];
