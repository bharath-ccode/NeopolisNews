import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PhoneRole = "sales" | "service" | "front_desk";

export interface ContactPhone {
  id?: string;
  phoneNumber: string;
  role: PhoneRole;
  sortOrder: number;
}

export interface Contact {
  id?: string;
  email: string | null;
  website: string | null;
  projectOwner: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  phones: ContactPhone[];
}

export interface TowerFloorPlan {
  id?: string;
  projectId?: string;
  unitPlanId: string;
  unitPlanIndex?: number;   // index into unitPlans array — used in form state / save
  floorFrom: number | null;
  floorTo: number | null;
  unitsPerFloor: number;
  sortOrder: number;
}

export interface Tower {
  id?: string;
  towerName: string;
  numFloors: number;
  sortOrder: number;
  floorPlans: TowerFloorPlan[];
}

export type UnitFacing =
  | "North" | "South" | "East" | "West"
  | "North-East" | "North-West" | "South-East" | "South-West";

export interface UnitPlan {
  id?: string;
  planName: string;
  bhk: number;
  maidRoom: boolean;
  homeOffice: boolean;
  sizeSqft: number;
  facing: UnitFacing | null;
  planUrl: string | null;
  sortOrder: number;
}

export interface ProjectDetail {
  id?: string;
  numTowers: number;
  maxFloors: number | null;
  amenitiesSqft: number | null;
  towers: Tower[];
}

export type ProjectType = "apartments" | "independent_homes" | "residential" | "mixed_use" | "commercial";
export type ProjectTier = "affordable" | "premium" | "luxury" | "uber_luxury";

export interface Project {
  id: string;
  projectName: string;
  builderId: string | null;
  builderName?: string | null;
  totalLandAreaAcres: number | null;
  totalUnits: number | null;
  coreNeopolis: boolean;
  projectLogoUrl: string | null;
  projectPlanUrl: string | null;
  projectType: ProjectType | null;
  tier: ProjectTier | null;
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  createdAt: string;
  updatedAt: string;
  contact?: Contact;
  projectDetail?: ProjectDetail;
  unitPlans?: UnitPlan[];
}

export interface ProjectInput {
  projectName: string;
  builderId: string | null;
  totalLandAreaAcres: number | null;
  totalUnits: number | null;
  coreNeopolis: boolean;
  projectLogoUrl: string | null;
  projectPlanUrl: string | null;
  projectType: ProjectType | null;
  tier: ProjectTier | null;
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  contact: Contact;
  projectDetail: ProjectDetail;
  unitPlans: UnitPlan[];
}

// ─── Mapping ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(row: any): Project {
  const contactRow = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts;
  const detailRow  = Array.isArray(row.project_details) ? row.project_details[0] : row.project_details;

  const contact: Contact | undefined = contactRow
    ? {
        id: contactRow.id,
        email: contactRow.email,
        website: contactRow.website,
        projectOwner: contactRow.project_owner,
        facebookUrl: contactRow.facebook_url,
        instagramUrl: contactRow.instagram_url,
        youtubeUrl: contactRow.youtube_url,
        phones: (contactRow.contact_phones ?? [])
          .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
          .map((p: { id: string; phone_number: string; role: PhoneRole; sort_order: number }) => ({
            id: p.id,
            phoneNumber: p.phone_number,
            role: p.role,
            sortOrder: p.sort_order,
          })),
      }
    : undefined;

  const projectDetail: ProjectDetail | undefined = detailRow
    ? {
        id: detailRow.id,
        numTowers: detailRow.num_towers,
        maxFloors: detailRow.max_floors ?? null,
        amenitiesSqft: detailRow.amenities_sqft ?? null,
        towers: (detailRow.towers ?? [])
          .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
          .map((t: {
            id: string; tower_name: string; num_floors: number; sort_order: number;
            tower_unit_plans?: { id: string; project_id: string; unit_plan_id: string; floor_from: number | null; floor_to: number | null; units_per_floor: number; sort_order: number }[];
          }) => ({
            id: t.id,
            towerName: t.tower_name,
            numFloors: t.num_floors,
            sortOrder: t.sort_order,
            floorPlans: (t.tower_unit_plans ?? [])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(fp => ({
                id: fp.id,
                projectId: fp.project_id,
                unitPlanId: fp.unit_plan_id,
                floorFrom: fp.floor_from,
                floorTo: fp.floor_to,
                unitsPerFloor: fp.units_per_floor ?? 1,
                sortOrder: fp.sort_order,
              })),
          })),
      }
    : undefined;

  const unitPlans: UnitPlan[] = (row.unit_plans ?? [])
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    .map((u: {
      id: string; plan_name: string; bhk: number; maid_room: boolean;
      home_office: boolean; size_sqft: number; facing: string | null;
      plan_url: string | null; sort_order: number;
    }) => ({
      id: u.id,
      planName: u.plan_name,
      bhk: u.bhk,
      maidRoom: u.maid_room,
      homeOffice: u.home_office,
      sizeSqft: u.size_sqft,
      facing: (u.facing as UnitFacing) ?? null,
      planUrl: u.plan_url ?? null,
      sortOrder: u.sort_order,
    }));

  return {
    id: row.id,
    projectName: row.project_name,
    builderId: row.builder_id,
    builderName: row.builders?.builder_name ?? null,
    totalLandAreaAcres: row.total_land_area_acres,
    totalUnits: row.total_units,
    coreNeopolis: row.core_neopolis ?? false,
    projectLogoUrl: row.project_logo_url,
    projectPlanUrl: row.project_plan_url ?? null,
    projectType: row.project_type ?? null,
    tier: row.tier ?? null,
    priceRangeMin: row.price_range_min ?? null,
    priceRangeMax: row.price_range_max ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contact,
    projectDetail,
    unitPlans,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("projects")
    .select("*, builders(builder_name)")
    .order("project_name");
  if (error) throw error;
  return (data ?? []).map(toProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("projects")
    .select(
      `*, builders(builder_name),
      contacts(id, email, website, project_owner, facebook_url, instagram_url, youtube_url,
        contact_phones(id, phone_number, role, sort_order)
      ),
      project_details(id, num_towers, max_floors, amenities_sqft,
        towers(id, tower_name, num_floors, sort_order,
          tower_unit_plans(id, project_id, unit_plan_id, floor_from, floor_to, units_per_floor, sort_order)
        )
      ),
      unit_plans(id, plan_name, bhk, maid_room, home_office, size_sqft, facing, plan_url, sort_order)`
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return toProject(data);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createProject(input: ProjectInput): Promise<Project> {
  const sb = createClient();

  const { data: proj, error: projErr } = await sb
    .from("projects")
    .insert({
      project_name:          input.projectName,
      builder_id:            input.builderId || null,
      total_land_area_acres: input.totalLandAreaAcres,
      total_units:           input.totalUnits,
      core_neopolis:         input.coreNeopolis,
      project_logo_url:      input.projectLogoUrl,
      project_plan_url:      input.projectPlanUrl,
      project_type:          input.projectType,
      tier:                  input.tier,
      price_range_min:       input.priceRangeMin,
      price_range_max:       input.priceRangeMax,
    })
    .select()
    .single();
  if (projErr) throw projErr;

  await saveNestedData(sb, proj.id, input);
  return (await getProjectById(proj.id))!;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const sb = createClient();

  const { error: projErr } = await sb
    .from("projects")
    .update({
      project_name:          input.projectName,
      builder_id:            input.builderId || null,
      total_land_area_acres: input.totalLandAreaAcres,
      total_units:           input.totalUnits,
      core_neopolis:         input.coreNeopolis,
      project_logo_url:      input.projectLogoUrl,
      project_plan_url:      input.projectPlanUrl,
      project_type:          input.projectType,
      tier:                  input.tier,
      price_range_min:       input.priceRangeMin,
      price_range_max:       input.priceRangeMax,
    })
    .eq("id", id);
  if (projErr) throw projErr;

  await saveNestedData(sb, id, input);
  return (await getProjectById(id))!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveNestedData(sb: ReturnType<typeof createClient>, projectId: string, input: ProjectInput) {
  // 1. Upsert contact
  const { data: contact, error: contactErr } = await sb
    .from("contacts")
    .upsert(
      {
        project_id:    projectId,
        email:         input.contact.email,
        website:       input.contact.website,
        project_owner: input.contact.projectOwner,
        facebook_url:  input.contact.facebookUrl,
        instagram_url: input.contact.instagramUrl,
        youtube_url:   input.contact.youtubeUrl,
      },
      { onConflict: "project_id" }
    )
    .select()
    .single();
  if (contactErr) throw contactErr;

  // 2. Delete + reinsert contact phones
  await sb.from("contact_phones").delete().eq("contact_id", contact.id);
  if (input.contact.phones.length > 0) {
    const { error: phoneErr } = await sb.from("contact_phones").insert(
      input.contact.phones.map((p, i) => ({
        contact_id:   contact.id,
        phone_number: p.phoneNumber,
        role:         p.role,
        sort_order:   i,
      }))
    );
    if (phoneErr) throw phoneErr;
  }

  // 3. Upsert project_details
  const { data: detail, error: detailErr } = await sb
    .from("project_details")
    .upsert(
      {
        project_id:     projectId,
        num_towers:     input.projectDetail.towers.length,
        max_floors:     input.projectDetail.maxFloors,
        amenities_sqft: input.projectDetail.amenitiesSqft,
      },
      { onConflict: "project_id" }
    )
    .select()
    .single();
  if (detailErr) throw detailErr;

  // 4. Save unit plans (preserve existing IDs so tower_unit_plans FKs remain valid)
  const unitPlanIds: string[] = [];
  const { data: existingUps } = await sb.from("unit_plans").select("id").eq("project_id", projectId);
  const existingUpIdSet = new Set((existingUps ?? []).map((u: { id: string }) => u.id));
  const keepUpIds = new Set(input.unitPlans.filter(u => u.id).map(u => u.id!));
  const toDeleteUpIds = Array.from(existingUpIdSet).filter(id => !keepUpIds.has(id));
  if (toDeleteUpIds.length > 0) {
    await sb.from("unit_plans").delete().in("id", toDeleteUpIds);
  }
  for (let i = 0; i < input.unitPlans.length; i++) {
    const u = input.unitPlans[i];
    const row = {
      plan_name: u.planName, bhk: u.bhk, maid_room: u.maidRoom,
      home_office: u.homeOffice, size_sqft: u.sizeSqft,
      facing: u.facing, plan_url: u.planUrl, sort_order: i,
    };
    if (u.id) {
      const { error: upErr } = await sb.from("unit_plans").update(row).eq("id", u.id);
      if (upErr) throw upErr;
      unitPlanIds.push(u.id);
    } else {
      const { data: newUp, error: upErr } = await sb.from("unit_plans")
        .insert({ project_id: projectId, ...row }).select("id").single();
      if (upErr) throw upErr;
      unitPlanIds.push(newUp.id);
    }
  }

  // 5. Delete + reinsert towers (ON DELETE CASCADE removes tower_unit_plans)
  await sb.from("towers").delete().eq("project_detail_id", detail.id);
  for (let i = 0; i < input.projectDetail.towers.length; i++) {
    const t = input.projectDetail.towers[i];
    const { data: newTower, error: towerErr } = await sb.from("towers").insert({
      project_detail_id: detail.id,
      tower_name:        t.towerName,
      num_floors:        t.numFloors,
      sort_order:        i,
    }).select("id").single();
    if (towerErr) throw towerErr;

    // Insert tower_unit_plans for this tower
    const validFps = (t.floorPlans ?? []).filter(fp =>
      fp.unitPlanIndex !== undefined && fp.unitPlanIndex >= 0 && unitPlanIds[fp.unitPlanIndex]
    );
    if (validFps.length > 0) {
      const { error: fpErr } = await sb.from("tower_unit_plans").insert(
        validFps.map((fp, j) => ({
          project_id:      projectId,
          tower_id:        newTower.id,
          unit_plan_id:    unitPlanIds[fp.unitPlanIndex!],
          floor_from:      fp.floorFrom,
          floor_to:        fp.floorTo,
          units_per_floor: fp.unitsPerFloor,
          sort_order:      j,
        }))
      );
      if (fpErr) throw fpErr;
    }
  }
}

export async function getProjectsByBuilderId(builderId: string): Promise<Project[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("projects")
    .select("*, builders(builder_name)")
    .eq("builder_id", builderId)
    .order("project_name");
  if (error) throw error;
  return (data ?? []).map(toProject);
}

export async function deleteProject(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) throw error;
}
