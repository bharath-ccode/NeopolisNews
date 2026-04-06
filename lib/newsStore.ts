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
  date: string;       // Display date e.g. "Mar 20, 2026"
  readTime: string;   // e.g. "3 min"
  views: number;
  sponsored: boolean;
  status: ArticleStatus;
  imageUrl?: string;
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
}

export const CATEGORY_META: Record<
  ArticleCategory,
  { label: string; tag: string; tagColor: TagColor }
> = {
  construction:  { label: "Construction",   tag: "Construction",  tagColor: "tag-orange" },
  launches:      { label: "New Launches",   tag: "New Launch",    tagColor: "tag-green"  },
  infrastructure:{ label: "Infrastructure", tag: "Infrastructure",tagColor: "tag-blue"   },
  community:     { label: "Community",      tag: "Community",     tagColor: "tag-purple" },
};

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_ARTICLES: Article[] = [
  {
    id: "featured",
    title: "Metro Connectivity to Neopolis Confirmed — Phase 2 Station Announced by DMRC",
    excerpt:
      "The Delhi Metro Rail Corporation has officially confirmed a Phase 2 extension that will bring a metro station directly into the Neopolis district by mid-2028.",
    content:
      "The Delhi Metro Rail Corporation has officially confirmed a Phase 2 extension that will bring a metro station directly into the Neopolis district by mid-2028. The announcement is expected to push property values up by 15–25% over the next 24 months, according to real estate analysts.\n\nThe new station, tentatively named 'Neopolis Central', will be part of the Blue Line extension. Construction is expected to begin in Q1 2027, with the station operational by June 2028.\n\nReal estate experts have already noted increased buyer interest in the district following the announcement, with enquiries up 40% in the week after the announcement.",
    category: "infrastructure",
    tag: "Infrastructure",
    tagColor: "tag-blue",
    author: "NeopolisNews Staff",
    date: "March 15, 2026",
    readTime: "5 min",
    views: 8421,
    sponsored: false,
    status: "published",
    createdAt: "2026-03-15T10:00:00.000Z",
    updatedAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "a1",
    title: "Apex Tower Reaches 18th Floor Slab — On Schedule for Dec 2026 Delivery",
    excerpt:
      "Apex Realty confirms structural milestone. Tower A completes 18th floor slab cast; Tower B at 14th floor.",
    content:
      "Apex Realty has confirmed a major structural milestone for their flagship development in Neopolis. Tower A has successfully completed the 18th floor slab casting, while Tower B is progressing at the 14th floor level.\n\nProject Director Rajesh Kumar stated that the development remains on schedule for December 2026 delivery. The project currently employs over 800 construction workers on-site.\n\nAmenities on floors 19–22 will include a sky lounge, swimming pool, gym, and concierge services. Possession certificates are expected to be issued in Q1 2027.",
    category: "construction",
    tag: "Construction",
    tagColor: "tag-orange",
    author: "NeopolisNews Staff",
    date: "Mar 20, 2026",
    readTime: "3 min",
    views: 3210,
    sponsored: false,
    status: "published",
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:00:00.000Z",
  },
  {
    id: "a2",
    title: "Phase 3 Residential Towers Open for Pre-Bookings — Prices Start ₹85 Lakh",
    excerpt:
      "SkyLine Corp opens Phase 3 pre-bookings with early-bird pricing. 120 ultra-luxury units launching.",
    content:
      "SkyLine Corp has announced the opening of pre-bookings for Phase 3 of their residential development in Neopolis. The launch includes 120 ultra-luxury units across two towers, with early-bird prices starting at ₹85 lakh.\n\nThe units range from 2 BHK (1,200 sq ft) to 4 BHK penthouses (2,800 sq ft). Early bird buyers receive a 5% discount and priority floor selection.\n\nRegistration can be done online or at the Neopolis sales office. Bookings close on April 30, 2026.",
    category: "launches",
    tag: "New Launch",
    tagColor: "tag-green",
    author: "NeopolisNews Staff",
    date: "Mar 10, 2026",
    readTime: "4 min",
    views: 5820,
    sponsored: true,
    status: "published",
    createdAt: "2026-03-10T11:00:00.000Z",
    updatedAt: "2026-03-10T11:00:00.000Z",
  },
  {
    id: "a3",
    title: "Neopolis RWA Formed — First General Body Meeting Scheduled for April 5",
    excerpt:
      "Residents of Neopolis Business Park and Apex Tower form a joint Residents Welfare Association.",
    content:
      "Residents of Neopolis Business Park and Apex Tower have come together to form a joint Residents Welfare Association (RWA). The inaugural general body meeting is scheduled for April 5, 2026.\n\nThe RWA will focus on community welfare, maintenance standards, security, and liaising with the municipal corporation for local infrastructure improvements.\n\nResidents wishing to join can register at the community center on Level G of Neopolis Business Park.",
    category: "community",
    tag: "Community",
    tagColor: "tag-purple",
    author: "Community Desk",
    date: "Mar 8, 2026",
    readTime: "2 min",
    views: 2100,
    sponsored: false,
    status: "published",
    createdAt: "2026-03-08T08:00:00.000Z",
    updatedAt: "2026-03-08T08:00:00.000Z",
  },
  {
    id: "a4",
    title: "6-Lane Arterial Road to Neopolis Gets NHAI Approval — Work Begins Q3 2026",
    excerpt:
      "National Highways Authority of India approves the 14km arterial road connecting Neopolis to NH-48.",
    content:
      "The National Highways Authority of India (NHAI) has approved the construction of a 14km, 6-lane arterial road that will directly connect Neopolis to National Highway 48.\n\nWork is expected to begin in Q3 2026. The road will significantly reduce commute times to the district from central areas, cutting travel time by an estimated 35 minutes during peak hours.\n\nLand acquisition for 11 of the 14km is complete. The remaining 3km involves negotiations with 22 landowners, expected to conclude by May 2026.",
    category: "infrastructure",
    tag: "Infrastructure",
    tagColor: "tag-blue",
    author: "NeopolisNews Staff",
    date: "Mar 5, 2026",
    readTime: "4 min",
    views: 4650,
    sponsored: false,
    status: "published",
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-05T10:00:00.000Z",
  },
  {
    id: "a5",
    title: "Grand Mall Foundation Complete — Steel Frame Erection Begins Next Week",
    excerpt:
      "Retail Spaces Ltd confirms completion of raft foundation for Neopolis Grand Mall's 5-level structure.",
    content:
      "Retail Spaces Ltd has confirmed the completion of the raft foundation for the Neopolis Grand Mall, a 5-level retail and entertainment complex scheduled to open in late 2027.\n\nSteel frame erection is set to begin next week. The mall will feature 250+ retail outlets, a multiplex cinema, food court, and indoor entertainment zone spread across 8 lakh square feet of built-up area.\n\nAnchor tenants already confirmed include two major hypermarket chains and a leading multiplex operator.",
    category: "construction",
    tag: "Construction",
    tagColor: "tag-orange",
    author: "NeopolisNews Staff",
    date: "Mar 3, 2026",
    readTime: "3 min",
    views: 2980,
    sponsored: false,
    status: "published",
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-03T09:00:00.000Z",
  },
  {
    id: "a6",
    title: "Neopolis Food Festival 2026 — Full Schedule & Participating Brands Revealed",
    excerpt:
      "The inaugural Neopolis Food Festival will run April 5–7 with 60+ food brands, live music, and chef showdowns.",
    content:
      "The inaugural Neopolis Food Festival is set to run from April 5–7, 2026, featuring over 60 food brands, live music performances, and competitive chef showdowns.\n\nEvent highlights include a Regional Cuisine Pavilion, Craft Beer Garden, Kids Food Art Workshop, and the Grand Chef Showdown with a ₹5 lakh prize.\n\nEntry is free; food tokens available at ₹100 each. The festival will be held at the Neopolis Central Park.",
    category: "community",
    tag: "Community",
    tagColor: "tag-purple",
    author: "Events Desk",
    date: "Feb 28, 2026",
    readTime: "3 min",
    views: 6200,
    sponsored: true,
    status: "published",
    createdAt: "2026-02-28T10:00:00.000Z",
    updatedAt: "2026-02-28T10:00:00.000Z",
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

const STORE_KEY = "neopolis_articles";

export function getArticles(): Article[] {
  if (typeof window === "undefined") return SEED_ARTICLES;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Article[];
    localStorage.setItem(STORE_KEY, JSON.stringify(SEED_ARTICLES));
    return SEED_ARTICLES;
  } catch {
    return SEED_ARTICLES;
  }
}

function saveArticles(articles: Article[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(articles));
}

export function getArticleById(id: string): Article | null {
  return getArticles().find((a) => a.id === id) ?? null;
}

export function createArticle(
  data: Omit<Article, "id" | "createdAt" | "updatedAt">
): Article {
  const article: Article = {
    ...data,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveArticles([...getArticles(), article]);
  return article;
}

export function updateArticle(
  id: string,
  data: Partial<Omit<Article, "id" | "createdAt">>
): Article | null {
  const articles = getArticles();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const updated: Article = {
    ...articles[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  articles[idx] = updated;
  saveArticles(articles);
  return updated;
}

export function deleteArticle(id: string): boolean {
  const articles = getArticles();
  const filtered = articles.filter((a) => a.id !== id);
  if (filtered.length === articles.length) return false;
  saveArticles(filtered);
  return true;
}

export function getArticleStats() {
  const articles = getArticles();
  return {
    total: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
    sponsored: articles.filter((a) => a.sponsored).length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
  };
}

// ─── Analytics mock data ──────────────────────────────────────────────────────

export interface DailyPageView {
  date: string;   // e.g. "Mar 28"
  views: number;
  visitors: number;
}

export function getMockPageViews(days = 14): DailyPageView[] {
  const result: DailyPageView[] = [];
  const base = new Date("2026-03-24");
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const views = Math.floor(800 + Math.random() * 1400);
    const visitors = Math.floor(views * (0.6 + Math.random() * 0.2));
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
  { page: "/",                    views: 18420, avgTime: "2m 14s", bounce: "42%" },
  { page: "/news",                views: 12350, avgTime: "3m 08s", bounce: "35%" },
  { page: "/real-estate",         views: 9810,  avgTime: "4m 22s", bounce: "28%" },
  { page: "/rentals",             views: 7640,  avgTime: "3m 51s", bounce: "31%" },
  { page: "/directory",           views: 5230,  avgTime: "2m 40s", bounce: "47%" },
  { page: "/services",            views: 3980,  avgTime: "1m 58s", bounce: "52%" },
  { page: "/advertise",           views: 2810,  avgTime: "2m 02s", bounce: "55%" },
  { page: "/auth/login",          views: 2140,  avgTime: "1m 12s", bounce: "30%" },
  { page: "/auth/register",       views: 1820,  avgTime: "3m 45s", bounce: "22%" },
];

export const MOCK_TRAFFIC_SOURCES = [
  { source: "Organic Search", pct: 44, color: "bg-brand-500" },
  { source: "Direct",         pct: 28, color: "bg-blue-500"  },
  { source: "Social Media",   pct: 16, color: "bg-purple-500"},
  { source: "Referral",       pct: 8,  color: "bg-orange-500"},
  { source: "Other",          pct: 4,  color: "bg-gray-400"  },
];
