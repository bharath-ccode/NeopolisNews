import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

/**
 * When a classified goes live, email everyone whose saved search matches.
 * Never throws — listing activation must not fail on notification errors.
 */
export async function notifyMatchingSavedSearches(
  admin: SupabaseClient,
  classifiedId: string
): Promise<void> {
  try {
    const { data: listing } = await admin
      .from("classifieds")
      .select("id, user_id, sub_category, listing_type, bedrooms, property_type, project_name, standalone_description, price, carpet_area_sqft")
      .eq("id", classifiedId)
      .single();
    if (!listing) return;

    const { data: searches } = await admin
      .from("saved_searches")
      .select("id, user_id, email, sub_category, listing_type, bedrooms, unsubscribe_token")
      .eq("is_active", true);
    if (!searches?.length) return;

    const matches = searches.filter(
      (s) =>
        s.user_id !== listing.user_id && // don't alert the poster
        (!s.sub_category || s.sub_category === listing.sub_category) &&
        (!s.listing_type || s.listing_type === listing.listing_type) &&
        (!s.bedrooms || s.bedrooms === listing.bedrooms)
    );
    if (!matches.length) return;

    const title = `${listing.bedrooms ? `${listing.bedrooms} BHK ` : ""}${String(listing.property_type).replace("_", " ")} for ${listing.listing_type}${listing.project_name ? ` in ${listing.project_name}` : ""}`;
    const url = `${SITE_URL}/real-estate/classifieds`;
    const resend = new Resend(process.env.RESEND_API_KEY);

    await Promise.allSettled(
      matches.map((s) =>
        resend.emails.send({
          from: "no-reply@neopolis.news",
          to: s.email,
          subject: `🏠 New listing matches your search: ${title}`,
          html: `
            <!DOCTYPE html>
            <html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
                <tr><td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
                    <tr><td>
                      <p style="margin:0 0 4px;font-size:13px;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">
                        New Listing · NeopolisNews
                      </p>
                      <h1 style="margin:0 0 12px;font-size:19px;color:#111827;text-transform:capitalize;">${title}</h1>
                      <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;">
                        ₹${listing.price}${listing.listing_type === "rent" ? "/month" : ""}
                        ${listing.carpet_area_sqft ? ` · ${listing.carpet_area_sqft} sq ft` : ""}
                      </p>
                      <a href="${url}" style="display:inline-block;background:#1d4ed8;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
                        View listing →
                      </a>
                      <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">
                        You get these because you saved a property search on NeopolisNews.
                        <a href="${SITE_URL}/api/saved-searches/unsubscribe?token=${s.unsubscribe_token}" style="color:#6b7280;">Stop this alert</a>
                      </p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body></html>
          `,
        })
      )
    );
  } catch (err) {
    console.error("notifyMatchingSavedSearches failed:", err);
  }
}
