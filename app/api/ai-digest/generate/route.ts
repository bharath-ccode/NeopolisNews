import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";
import {
  DIGEST_LEVELS,
  LEVEL_LABELS,
  LEVEL_TAGS,
  fetchHeadlines,
  type DigestLevel,
  type HeadlineItem,
} from "@/lib/digestSources";

export const maxDuration = 60;

const client = new Anthropic();

interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
}

async function generateForLevel(
  level: DigestLevel,
  headlines: HeadlineItem[]
): Promise<GeneratedArticle> {
  const headlineText = headlines
    .map((h, i) => `${i + 1}. [${h.source}] ${h.title}${h.description ? ` — ${h.description}` : ""}`)
    .join("\n");

  const levelLabel = LEVEL_LABELS[level];
  const tag = LEVEL_TAGS[level];

  const prompt = `You are a journalist for NeopolisNews, a digital news platform for Hyderabad's business and IT professional community (tech workers, startup founders, corporate employees, investors).

Today's ${levelLabel} news headlines:
${headlineText}

Write one comprehensive news digest article that:
1. Synthesizes the 3–5 most impactful stories from these headlines
2. Explains concretely how these developments affect Hyderabad's IT employees, entrepreneurs, and business professionals
3. Takes a slightly progressive, worker-friendly perspective — supportive of public services, wage growth, workers' rights, environment, and equitable growth; constructively critical of monopolistic behavior or policy failures
4. Is factual, grounded, and analytical — not sensational
5. Is written for educated professionals who value nuanced analysis, not clickbait

Tone: Thoughtful, slightly Left-of-centre politically (like a good financial journalist who cares about people, not just markets). Similar to The Wire or The Hindu editorial voice.

Format your response as valid JSON ONLY (no markdown fences) with this exact structure:
{
  "title": "Compelling headline under 80 characters for the ${tag} digest",
  "excerpt": "2-sentence summary under 220 characters explaining impact on Hyderabad professionals",
  "content": "Full article body in HTML. Use <p> for paragraphs, <h2> for section headers, <ul><li> for lists. Minimum 350 words. End with a 'What This Means for You' section.",
  "readTime": "X min read"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (message.content[0] as { type: string; text: string }).text.trim();
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(cleaned) as GeneratedArticle;
}

// Vercel Cron hits GET (generates all levels one-by-one via internal calls isn't possible,
// so cron generates all sequentially — acceptable since it runs unattended at 4 AM)
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  // Cron: generate all missing levels sequentially
  return runGenerate(null);
}

// Admin manual: POST with { level } to generate one level at a time (avoids timeout)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { level?: string };
  const level = (body.level ?? null) as DigestLevel | null;
  if (level && !DIGEST_LEVELS.includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  return runGenerate(level);
}

async function runGenerate(onlyLevel: DigestLevel | null) {
  const sb = createAdminClient();
  const todayIST = getTodayIST();

  const { data: existing } = await sb
    .from("articles")
    .select("id, digest_level")
    .eq("digest_date", todayIST)
    .in("status", ["draft", "published"]);

  const existingLevels = new Set(
    (existing ?? []).map((r: { digest_level: string }) => r.digest_level)
  );

  // If a specific level was requested, only generate that one
  const levelsToGenerate = onlyLevel
    ? (existingLevels.has(onlyLevel) ? [] : [onlyLevel])
    : DIGEST_LEVELS.filter((l) => !existingLevels.has(l));

  if (levelsToGenerate.length === 0) {
    return NextResponse.json({ message: "Already generated", date: todayIST });
  }

  const results: { level: DigestLevel; articleId: string | null; error?: string }[] = [];

  for (const level of levelsToGenerate) {
    try {
      const headlines = await fetchHeadlines(level);
      if (headlines.length === 0) {
        results.push({ level, articleId: null, error: "No headlines fetched" });
        continue;
      }

      const generated = await generateForLevel(level, headlines);

      const { data: inserted, error } = await sb
        .from("articles")
        .insert({
          title:            generated.title,
          excerpt:          generated.excerpt,
          content:          generated.content,
          category:         "community",
          tag:              LEVEL_TAGS[level],
          tag_color:        "tag-blue",
          author:           "NeopolisNews AI",
          date:             formatDisplayDate(todayIST),
          read_time:        generated.readTime,
          views:            0,
          sponsored:        false,
          status:           "draft",
          digest_date:      todayIST,
          digest_level:     level,
          digest_headlines: JSON.stringify(headlines),
        })
        .select("id")
        .single();

      if (error) throw error;
      results.push({ level, articleId: (inserted as { id: string }).id });
    } catch (err) {
      results.push({ level, articleId: null, error: String(err) });
    }
  }

  return NextResponse.json({ date: todayIST, results });
}

function getTodayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
