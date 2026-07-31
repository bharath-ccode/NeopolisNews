import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AnnouncementStatus = "active" | "closed" | "pending_approval";

export interface Announcement {
  id: string;
  projectId: string;
  unitPlanId: string | null;
  unitPlanName: string | null;
  unitPlanSummary: string | null; // e.g. "4 BHK + M + HO · 7460 sft · East"
  towerId: string | null;
  towerName: string | null;
  floorFrom: number | null;
  floorTo: number | null;
  unitsAvailable: number | null;
  pricePerSqft: number | null;
  message: string | null;
  validUntil: string | null;
  status: AnnouncementStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementInput {
  projectId: string;
  unitPlanId: string | null;
  towerId: string | null;
  floorFrom: number | null;
  floorTo: number | null;
  unitsAvailable: number | null;
  pricePerSqft: number | null;
  message: string | null;
  validUntil: string | null;
  status: AnnouncementStatus;
}

// ─── Mapping ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toAnnouncement(row: any): Announcement {
  const up = row.unit_plans;
  const unitPlanSummary = up
    ? [
        `${up.bhk} BHK`,
        up.maid_room   ? "M"  : null,
        up.home_office ? "HO" : null,
        up.size_sqft   ? `${up.size_sqft.toLocaleString()} sft` : null,
        up.facing      || null,
      ].filter(Boolean).join(" + ").replace("+ M +", "+ M +").replace("+ HO +", "+ HO ·")
    : null;

  return {
    id:              row.id,
    projectId:       row.project_id,
    unitPlanId:      row.unit_plan_id ?? null,
    unitPlanName:    up?.plan_name ?? null,
    unitPlanSummary,
    towerId:         row.tower_id ?? null,
    towerName:       row.towers?.tower_name ?? null,
    floorFrom:       row.floor_from ?? null,
    floorTo:         row.floor_to ?? null,
    unitsAvailable:  row.units_available ?? null,
    pricePerSqft:    row.price_per_sqft ?? null,
    message:         row.message ?? null,
    validUntil:      row.valid_until ?? null,
    status:          row.status,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

const UNIT_PLAN_SELECT = "plan_name, bhk, maid_room, home_office, size_sqft, facing";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAnnouncementsByProject(projectId: string): Promise<Announcement[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("availability_announcements")
    .select(`*, unit_plans(${UNIT_PLAN_SELECT}), towers(tower_name)`)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toAnnouncement);
}

export async function getActiveAnnouncementsByProject(projectId: string): Promise<Announcement[]> {
  const sb = createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await sb
    .from("availability_announcements")
    .select(`*, unit_plans(${UNIT_PLAN_SELECT}), towers(tower_name)`)
    .eq("project_id", projectId)
    .eq("status", "active")
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toAnnouncement);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  const sb = createClient();
  const { data, error } = await sb
    .from("availability_announcements")
    .insert({
      project_id:      input.projectId,
      unit_plan_id:    input.unitPlanId,
      tower_id:        input.towerId,
      floor_from:      input.floorFrom,
      floor_to:        input.floorTo,
      units_available: input.unitsAvailable,
      price_per_sqft:  input.pricePerSqft,
      message:         input.message,
      valid_until:     input.validUntil,
      status:          input.status,
    })
    .select(`*, unit_plans(${UNIT_PLAN_SELECT}), towers(tower_name)`)
    .single();
  if (error) throw error;
  return toAnnouncement(data);
}

export async function updateAnnouncementStatus(id: string, status: AnnouncementStatus): Promise<void> {
  const sb = createClient();
  const { error } = await sb
    .from("availability_announcements")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("availability_announcements").delete().eq("id", id);
  if (error) throw error;
}
