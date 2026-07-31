import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { translateToTelugu } from "@/lib/translate";

export const dynamic = "force-dynamic";

/** GET — the article's English original + its Telugu translation (if any). */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sb = createAdminClient();

  const [{ data: article }, { data: translation }] = await Promise.all([
    sb
      .from("articles")
      .select("id, title, excerpt, content, status")
      .eq("id", params.id)
      .single(),
    sb
      .from("article_translations")
      .select("title, excerpt, content, updated_at")
      .eq("article_id", params.id)
      .eq("lang", "te")
      .maybeSingle(),
  ]);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  return NextResponse.json({ article, translation });
}

/** PUT — save a human-edited Telugu translation. */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null) as
    | { title?: string; excerpt?: string; content?: string }
    | null;
  if (!body?.title?.trim() || !body?.excerpt?.trim() || !body?.content?.trim()) {
    return NextResponse.json(
      { error: "title, excerpt and content are required" },
      { status: 400 }
    );
  }

  const sb = createAdminClient();
  const { error } = await sb
    .from("article_translations")
    .upsert(
      {
        article_id: params.id,
        lang: "te",
        title: body.title.trim(),
        excerpt: body.excerpt.trim(),
        content: body.content.trim(),
      },
      { onConflict: "article_id,lang" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

/** POST — regenerate the machine translation from the English original,
 *  overwriting whatever is cached. */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sb = createAdminClient();

  const { data: article } = await sb
    .from("articles")
    .select("id, title, excerpt, content")
    .eq("id", params.id)
    .single();
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const translation = await translateToTelugu(article);
    const { error } = await sb
      .from("article_translations")
      .upsert(
        { article_id: params.id, lang: "te", ...translation },
        { onConflict: "article_id,lang" }
      );
    if (error) throw new Error(error.message);
    return NextResponse.json({ translation });
  } catch (err) {
    console.error("regenerate translation:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }
}
