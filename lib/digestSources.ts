export type DigestLevel = "international" | "national" | "state" | "city";

// Geographic scope rules injected into every prompt — keeps each article on-topic
export const LEVEL_SCOPE: Record<DigestLevel, string> = {
  international:
    "SCOPE: Write ONLY about global/world events. Do NOT include India-specific, Telangana-specific, or Hyderabad-specific news. Cover geopolitical, economic, tech, and climate developments that matter globally.",
  national:
    "SCOPE: Write ONLY about India-wide news — national economy, central government policy, pan-India industry trends, RBI/SEBI decisions. Do NOT include international events or Telangana/Hyderabad-specific local stories.",
  state:
    "SCOPE: Write ONLY about Telangana state-level news — state government policy, Hyderabad metro region infrastructure, Telangana industry, state budget, IT corridor developments. Do NOT cover purely national or international events.",
  city:
    "SCOPE: Write ONLY about Hyderabad city-level news — local civic issues, GHMC, HMDA, local business openings, Neopolis district, Hitec City, Gachibowli, specific city-level events. Do NOT include national or state-level policy news.",
};

export interface DigestSource {
  name: string;
  url: string;
  level: DigestLevel;
}

export const DIGEST_SOURCES: DigestSource[] = [
  // International
  { name: "BBC News",         url: "https://feeds.bbci.co.uk/news/rss.xml",                            level: "international" },
  { name: "Reuters Business", url: "https://feeds.reuters.com/reuters/businessNews",                    level: "international" },

  // National (India)
  { name: "Economic Times",   url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",          level: "national" },
  { name: "NDTV",             url: "https://feeds.feedburner.com/ndtvnews-top-stories",                 level: "national" },

  // State (Telangana)
  { name: "Telangana Today",  url: "https://telanganatoday.com/feed",                                   level: "state" },
  { name: "Hans India",       url: "https://www.thehansindia.com/rss/telangana.xml",                    level: "state" },

  // City (Hyderabad)
  { name: "TOI Hyderabad",    url: "https://timesofindia.indiatimes.com/rssfeeds/2646863.cms",          level: "city" },
  { name: "Deccan Chronicle", url: "https://www.deccanchronicle.com/rss.xml",                           level: "city" },
];

export const DIGEST_LEVELS: DigestLevel[] = ["international", "national", "state", "city"];

export const LEVEL_LABELS: Record<DigestLevel, string> = {
  international: "International",
  national:      "National (India)",
  state:         "State (Telangana)",
  city:          "City (Hyderabad)",
};

export const LEVEL_TAGS: Record<DigestLevel, string> = {
  international: "World",
  national:      "India",
  state:         "Telangana",
  city:          "Hyderabad",
};

// Simple RSS XML parser — no dependencies needed
function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTag(xml: string, tag: string): string | null {
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`,
    "i"
  );
  const m = re.exec(xml);
  if (!m) return null;
  return stripHtml((m[1] ?? m[2] ?? "").trim());
}

export interface HeadlineItem {
  title: string;
  description: string;
  source: string;
}

function parseItems(xml: string, sourceName: string, max = 6): HeadlineItem[] {
  const items: HeadlineItem[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null && items.length < max) {
    const block = m[1];
    const title = extractTag(block, "title");
    if (!title || title.toLowerCase().includes("advertisement")) continue;
    const description = extractTag(block, "description") ?? "";
    items.push({ title, description: description.slice(0, 200), source: sourceName });
  }
  return items;
}

export async function fetchHeadlines(level: DigestLevel): Promise<HeadlineItem[]> {
  const sources = DIGEST_SOURCES.filter((s) => s.level === level);
  const results = await Promise.allSettled(
    sources.map(async (s) => {
      const res = await fetch(s.url, {
        headers: { "User-Agent": "NeopolisNews/1.0 RSS Reader" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`${s.name}: HTTP ${res.status}`);
      const xml = await res.text();
      return parseItems(xml, s.name);
    })
  );
  return results
    .filter((r): r is PromiseFulfilledResult<HeadlineItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .slice(0, 12);
}
