import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  const admin = createAdminClient();

  const [subRes, artRes, bizRes] = await Promise.all([
    admin
      .from("digest_subscribers")
      .select("email, name")
      .eq("is_active", true),
    admin
      .from("articles")
      .select("id, title, excerpt, tag, date")
      .eq("status", "published")
      .order("date", { ascending: false })
      .limit(4),
    admin
      .from("businesses")
      .select("id, name, industry, address")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("name")
      .limit(3),
  ]);

  const subscribers = subRes.data ?? [];
  if (subscribers.length === 0)
    return NextResponse.json({ error: "No active subscribers." }, { status: 400 });

  const articles = artRes.data ?? [];
  const businesses = bizRes.data ?? [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

  const html = buildDigestEmail({ articles, businesses, siteUrl });

  const results = await Promise.allSettled(
    subscribers.map(({ email }) =>
      resend.emails.send({
        from: "NeopolisNews <no-reply@neopolis.news>",
        to: email,
        subject: `NeopolisNews Weekly Digest — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
        html,
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ sent, failed, total: subscribers.length });
}

function buildDigestEmail({
  articles,
  businesses,
  siteUrl,
}: {
  articles: { id: string; title: string; excerpt: string | null; tag: string | null; date: string }[];
  businesses: { id: string; name: string; industry: string; address: string }[];
  siteUrl: string;
}) {
  const articleRows = articles
    .map(
      (a) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #f3f4f6">
        ${a.tag ? `<p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.05em">${a.tag}</p>` : ""}
        <a href="${siteUrl}/news/${a.id}" style="text-decoration:none;color:#111827;font-size:15px;font-weight:700;line-height:1.4">${a.title}</a>
        ${a.excerpt ? `<p style="margin:6px 0 0;font-size:13px;color:#6b7280;line-height:1.5">${a.excerpt}</p>` : ""}
        <a href="${siteUrl}/news/${a.id}" style="display:inline-block;margin-top:8px;font-size:12px;color:#2563eb;font-weight:600;text-decoration:none">Read more →</a>
      </td>
    </tr>`
    )
    .join("");

  const bizRows = businesses
    .map(
      (b) => `
    <tr>
      <td style="padding:12px 14px;background:#fafafa;border-radius:8px;margin-bottom:8px;display:block">
        <a href="${siteUrl}/businesses/${b.id}" style="text-decoration:none;color:#111827;font-weight:700;font-size:14px">${b.name}</a>
        <p style="margin:2px 0 0;font-size:12px;color:#6b7280">${b.industry} · ${b.address}</p>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">

  <!-- Header -->
  <div style="background:#0f2a4a;padding:28px 32px">
    <p style="color:#7eb3e8;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">Weekly Digest</p>
    <h1 style="color:white;margin:0;font-size:22px;font-weight:800">NeopolisNews</h1>
    <p style="color:#94b8d6;margin:6px 0 0;font-size:13px">
      ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
    </p>
  </div>

  <div style="padding:32px">

    ${articles.length > 0 ? `
    <!-- News -->
    <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin:0 0 4px">Latest News</h2>
    <table style="width:100%;border-collapse:collapse">${articleRows}</table>
    ` : ""}

    ${businesses.length > 0 ? `
    <!-- Featured -->
    <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin:28px 0 12px">Featured in the District</h2>
    <table style="width:100%;border-collapse:collapse;border-spacing:0 8px">${bizRows}</table>
    ` : ""}

    <!-- CTA -->
    <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6">
      <a href="${siteUrl}" style="display:inline-block;background:#0f2a4a;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px">
        Visit NeopolisNews →
      </a>
    </div>

    <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:24px">
      You're receiving this because you subscribed to the NeopolisNews digest.<br>
      <a href="${siteUrl}/unsubscribe" style="color:#9ca3af">Unsubscribe</a>
    </p>
  </div>
</div>
</body></html>`;
}
