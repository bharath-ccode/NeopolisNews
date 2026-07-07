import type { SupabaseClient } from "@supabase/supabase-js";

/** Default points for attending a club event, by club category.
 *  Civic participation is deliberately worth more. */
export const DEFAULT_EVENT_POINTS: Record<string, number> = {
  civic_green:     50,
  sports_fitness:  20,
  hobbies_culture: 20,
  kids_family:     20,
};

/** Attending a paid wellness session (marked by the trainer/business). */
export const WELLNESS_ATTENDANCE_POINTS = 20;

/** Visiting a business for a confirmed appointment (marked done by the business). */
export const APPOINTMENT_VISIT_POINTS = 10;

/** A citizen report approved and published by the admin. */
export const CITIZEN_REPORT_POINTS = 15;

/** Ledger source types that count as "showing up" for streaks/badges. */
export const ACTIVITY_SOURCES = [
  "club_event_attendance",
  "wellness_session_attendance",
  "appointment_visit",
] as const;

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  detail: string;
}

export interface PointsStats {
  month_points: number;
  month_activities: number;
  streak_months: number;
  total_activities: number;
  badges: Badge[];
}

/** Derive streak + badges from raw ledger entries (no extra tables). */
export function computeStats(
  entries: { points: number; kind: string; source_type: string | null; created_at: string }[]
): PointsStats {
  const now = new Date();
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const thisMonth = monthKey(now);

  const earns = entries.filter((e) => e.kind === "earn" && e.points > 0);
  const activities = earns.filter(
    (e) => e.source_type && (ACTIVITY_SOURCES as readonly string[]).includes(e.source_type)
  );

  const monthPoints = earns
    .filter((e) => monthKey(new Date(e.created_at)) === thisMonth)
    .reduce((s, e) => s + e.points, 0);
  const monthActivities = activities.filter(
    (e) => monthKey(new Date(e.created_at)) === thisMonth
  ).length;

  // Streak: consecutive calendar months (ending this month or last month)
  // with at least one activity.
  const activeMonths = new Set(activities.map((e) => monthKey(new Date(e.created_at))));
  let streak = 0;
  const cursor = new Date(now);
  if (!activeMonths.has(monthKey(cursor))) cursor.setMonth(cursor.getMonth() - 1); // grace: current month not over
  while (activeMonths.has(monthKey(cursor))) {
    streak++;
    cursor.setMonth(cursor.getMonth() - 1);
  }

  const totalPoints = earns.reduce((s, e) => s + e.points, 0);
  const totalActivities = activities.length;

  const badges: Badge[] = [];
  if (totalActivities >= 1)
    badges.push({ id: "first_step", emoji: "🌱", label: "First Step", detail: "Attended a first activity" });
  if (streak >= 3)
    badges.push({ id: "on_a_streak", emoji: "🔥", label: "On a Streak", detail: `${streak} months active in a row` });
  if (totalPoints >= 100)
    badges.push({ id: "century", emoji: "⭐", label: "Century", detail: "Earned 100+ points" });
  if (totalPoints >= 500)
    badges.push({ id: "club_500", emoji: "🏆", label: "500 Club", detail: "Earned 500+ points" });
  if (totalActivities >= 25)
    badges.push({ id: "pillar", emoji: "🤝", label: "Neighbourhood Pillar", detail: "25+ activities attended" });

  return {
    month_points: monthPoints,
    month_activities: monthActivities,
    streak_months: streak,
    total_activities: totalActivities,
    badges,
  };
}

export interface AwardInput {
  userId: string;
  points: number;
  sourceType: string; // e.g. "club_event_attendance"
  sourceId: string;   // e.g. the event id
  description: string;
}

/**
 * Append an earn entry to the points ledger. Idempotent: the unique index on
 * (user_id, source_type, source_id) means re-running an award is a no-op.
 */
export async function awardPoints(
  admin: SupabaseClient,
  input: AwardInput
): Promise<{ awarded: boolean; error?: string }> {
  if (input.points <= 0) return { awarded: false };

  const { error } = await admin.from("user_points_ledger").upsert(
    {
      user_id:     input.userId,
      points:      input.points,
      kind:        "earn",
      source_type: input.sourceType,
      source_id:   input.sourceId,
      description: input.description,
    },
    { onConflict: "user_id,source_type,source_id", ignoreDuplicates: true }
  );

  if (error) return { awarded: false, error: error.message };
  return { awarded: true };
}

/** Sum a user's ledger. */
export async function getPointsBalance(
  admin: SupabaseClient,
  userId: string
): Promise<number> {
  const { data } = await admin
    .from("user_points_ledger")
    .select("points")
    .eq("user_id", userId);
  return (data ?? []).reduce((sum, row) => sum + row.points, 0);
}
