import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { awardPoints, CITIZEN_REPORT_POINTS } from "@/lib/points";

export const dynamic = "force-dynamic";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain-text report body → simple paragraph HTML for the article renderer. */
function toArticleHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** PATCH { action: "approve" | "reject", admin_note? }
 *  Approve publishes the report into articles (category "community"). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { action, admin_note } = body as { action?: string; admin_note?: string };
  if (action !== "approve" && action !== "reject")
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });

  const admin = createAdminClient();

  const { data: report, error: reportErr } = await admin
    .from("citizen_reports")
    .select("*")
    .eq("id", params.id)
    .single();
  if (reportErr || !report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (report.status !== "pending")
    return NextResponse.json({ error: `Report already ${report.status}.` }, { status: 409 });

  if (action === "reject") {
    const { error } = await admin
      .from("citizen_reports")
      .update({
        status:      "rejected",
        admin_note:  admin_note?.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  // Approve → publish as a Community article credited to the reporter
  const bodyText: string = report.body;
  const words = bodyText.trim().split(/\s+/).length;
  const readTime = `${Math.max(1, Math.round(words / 200))} min`;
  const excerpt =
    bodyText.length > 180 ? `${bodyText.slice(0, 177).trimEnd()}…` : bodyText;

  const { data: article, error: articleErr } = await admin
    .from("articles")
    .insert({
      title:     report.title,
      excerpt,
      content:   toArticleHtml(bodyText),
      category:  "community",
      tag:       "Community",
      tag_color: "tag-purple",
      author:    `@${report.author_name}`,
      date:      formatDisplayDate(new Date().toISOString()),
      read_time: readTime,
      views:     0,
      sponsored: false,
      status:    "published",
      image_url: report.image_url ?? null,
      source:    report.area ? `Citizen Report · ${report.area}` : "Citizen Report",
    })
    .select("id")
    .single();
  if (articleErr) return NextResponse.json({ error: articleErr.message }, { status: 500 });

  const { error: updateErr } = await admin
    .from("citizen_reports")
    .update({
      status:      "approved",
      admin_note:  admin_note?.trim() || null,
      article_id:  article.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", params.id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Published local reporting earns points (idempotent per report)
  if (report.user_id) {
    await awardPoints(admin, {
      userId:      report.user_id,
      points:      CITIZEN_REPORT_POINTS,
      sourceType:  "citizen_report_published",
      sourceId:    report.id,
      description: `Local report published: ${report.title}`,
    });
  }

  return NextResponse.json({ ok: true, status: "approved", article_id: article.id });
}
