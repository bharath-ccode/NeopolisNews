import type { SupabaseClient } from "@supabase/supabase-js";

export const CLUB_CATEGORIES = [
  { id: "sports_fitness",  label: "Sports & Fitness",  emoji: "🏃" },
  { id: "civic_green",     label: "Civic & Green",     emoji: "🌳" },
  { id: "hobbies_culture", label: "Hobbies & Culture", emoji: "🎨" },
  { id: "kids_family",     label: "Kids & Family",     emoji: "👨‍👩‍👧" },
] as const;

export type ClubCategory = (typeof CLUB_CATEGORIES)[number]["id"];

export function isClubCategory(v: string): v is ClubCategory {
  return CLUB_CATEGORIES.some((c) => c.id === v);
}

/** True if the user leads this active club. */
export async function isClubLead(
  admin: SupabaseClient,
  clubId: string,
  userId: string
): Promise<boolean> {
  const { data } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", clubId)
    .eq("user_id", userId)
    .eq("role", "lead")
    .maybeSingle();
  return Boolean(data);
}

/** Recount and persist a club's member_count. */
export async function refreshMemberCount(
  admin: SupabaseClient,
  clubId: string
): Promise<void> {
  const { count } = await admin
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("club_id", clubId);
  await admin.from("clubs").update({ member_count: count ?? 0 }).eq("id", clubId);
}
