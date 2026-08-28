import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { runBusinessDiscovery } from "@/lib/businessDiscovery";

// Not currently scheduled — removed from vercel.json's crons array while
// the admin-driven search-plan selection (industry/type/subtype + a single
// locality per run, see /admin/business-discovery) is still settling. The
// route itself is untouched so it can be re-added to vercel.json once the
// full, unscoped monthly sweep is wanted again; CRON_SECRET still gates it.
export const maxDuration = 300; // multiple industry x locality x specialty searches; give it room

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const summary = await runBusinessDiscovery();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "no-reply@neopolis.news",
      to: adminEmail,
      subject: `Business discovery: ${summary.newCandidates} new, ${summary.changedCandidates} changed`,
      html: `
        <p>Monthly business discovery run finished.</p>
        <ul>
          <li>${summary.queried} searches run</li>
          <li>${summary.newCandidates} new candidates found</li>
          <li>${summary.changedCandidates} previously-approved listings changed and need re-review</li>
          ${summary.errors.length ? `<li>${summary.errors.length} search errors</li>` : ""}
        </ul>
        <p>Review at <a href="https://neopolis.news/admin/business-discovery">/admin/business-discovery</a>.</p>
        ${summary.errors.length ? `<pre>${summary.errors.slice(0, 10).join("\n")}</pre>` : ""}
      `,
    }).catch(() => {}); // Don't fail the cron run over a notification email
  }

  return NextResponse.json(summary);
}
