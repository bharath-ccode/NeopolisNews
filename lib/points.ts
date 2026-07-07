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
