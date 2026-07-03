import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

/**
 * Email everyone subscribed to a project when a construction update is
 * published for it. Failures are logged but never thrown — publishing an
 * article must not fail because a notification could not be sent.
 */
export async function notifyProjectSubscribers(
  admin: SupabaseClient,
  article: {
    id: string;
    title: string;
    excerpt: string;
    image_url?: string | null;
    project_id: string;
  }
): Promise<void> {
  try {
    const [{ data: project }, { data: subscribers }] = await Promise.all([
      admin.from("projects").select("project_name").eq("id", article.project_id).single(),
      admin
        .from("project_subscriptions")
        .select("email, unsubscribe_token")
        .eq("project_id", article.project_id)
        .eq("is_active", true),
    ]);

    if (!project || !subscribers?.length) return;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const articleUrl = `${SITE_URL}/news/${article.id}`;

    await Promise.allSettled(
      subscribers.map(({ email, unsubscribe_token }) => {
        const unsubUrl = `${SITE_URL}/api/project-subscriptions/unsubscribe?token=${unsubscribe_token}`;
        return resend.emails.send({
          from: "no-reply@neopolis.news",
          to: email,
          subject: `🏗️ ${project.project_name}: ${article.title}`,
          html: `
            <!DOCTYPE html>
            <html>
              <body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
                  <tr><td align="center">
                    <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
                      <tr><td>
                        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">
                          Construction Update · ${project.project_name}
                        </p>
                        <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">${article.title}</h1>
                        ${article.image_url ? `<img src="${article.image_url}" alt="" width="400" style="max-width:100%;border-radius:8px;margin:0 0 16px;" />` : ""}
                        <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">${article.excerpt}</p>
                        <a href="${articleUrl}"
                           style="display:inline-block;background:#1d4ed8;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
                          Read the full update →
                        </a>
                        <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">
                          You get these emails because you subscribed to construction updates for
                          ${project.project_name} on NeopolisNews.
                          <a href="${unsubUrl}" style="color:#6b7280;">Unsubscribe</a>
                        </p>
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
              </body>
            </html>
          `,
        });
      })
    );
  } catch (err) {
    console.error("notifyProjectSubscribers failed:", err);
  }
}
