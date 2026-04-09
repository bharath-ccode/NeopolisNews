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

export interface FloorPlan {
  id?: string;
  imageUrl: string;
  floorLabel: string | null;
  sortOrder: number;
}

export interface Tower {
  id?: string;
  towerName: string;
  numFloors: number;
  sortOrder: number;
  floorPlans: FloorPlan[];
}

export interface ProjectDetail {
  id?: string;
  numTowers: number;
  towers: Tower[];
}

export interface Project {
  id: string;
  projectName: string;
  builderId: string | null;
  builderName?: string | null;
  totalLandAreaAcres: number | null;
  totalUnits: number | null;
  coreNeopolis: boolean;
  projectLogoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  contact?: Contact;
  projectDetail?: ProjectDetail;
}

export interface ProjectInput {
  projectName: string;
  builderId: string | null;
  totalLandAreaAcres: number | null;
  totalUnits: number | null;
  coreNeopolis: boolean;
  projectLogoUrl: string | null;
  contact: Contact;
  projectDetail: ProjectDetail;
}

// ─── Mapping ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(row: any): Project {
  const contactRow = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts;
  const detailRow = Array.isArray(row.project_details)
    ? row.project_details[0]
    : row.project_details;

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
        towers: (detailRow.towers ?? [])
          .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
          .map((t: { id: string; tower_name: string; num_floors: number; sort_order: number; floor_plans: { id: string; image_url: string; floor_label: string; sort_order: number }[] }) => ({
            id: t.id,
            towerName: t.tower_name,
            numFloors: t.num_floors,
            sortOrder: t.sort_order,
            floorPlans: (t.floor_plans ?? [])
              .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
              .map((fp: { id: string; image_url: string; floor_label: string; sort_order: number }) => ({
                id: fp.id,
                imageUrl: fp.image_url,
                floorLabel: fp.floor_label,
                sortOrder: fp.sort_order,
              })),
          })),
      }
    : undefined;

  return {
    id: row.id,
    projectName: row.project_name,
    builderId: row.builder_id,
    builderName: row.builders?.builder_name ?? null,
    totalLandAreaAcres: row.total_land_area_acres,
    totalUnits: row.total_units,
    coreNeopolis: row.core_neopolis ?? false,
    projectLogoUrl: row.project_logo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contact,
    projectDetail,
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
      project_details(id, num_towers,
        towers(id, tower_name, num_floors, sort_order,
          floor_plans(id, image_url, floor_label, sort_order)
        )
      )`
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return toProject(data);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createProject(input: ProjectInput): Promise<Project> {
  const sb = createClient();

  // 1. Insert project
  const { data: proj, error: projErr } = await sb
    .from("projects")
    .insert({
      project_name: input.projectName,
      builder_id: input.builderId || null,
      total_land_area_acres: input.totalLandAreaAcres,
      total_units: input.totalUnits,
      core_neopolis: input.coreNeopolis,
      project_logo_url: input.projectLogoUrl,
    })
    .select()
    .single();
  if (projErr) throw projErr;

  await saveNestedData(sb, proj.id, input);

  return (await getProjectById(proj.id))!;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const sb = createClient();

  // 1. Update project
  const { error: projErr } = await sb
    .from("projects")
    .update({
      project_name: input.projectName,
      builder_id: input.builderId || null,
      total_land_area_acres: input.totalLandAreaAcres,
      total_units: input.totalUnits,
      core_neopolis: input.coreNeopolis,
      project_logo_url: input.projectLogoUrl,
    })
    .eq("id", id);
  if (projErr) throw projErr;

  await saveNestedData(sb, id, input);

  return (await getProjectById(id))!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveNestedData(sb: ReturnType<typeof createClient>, projectId: string, input: ProjectInput) {
  // 2. Upsert contact
  const { data: contact, error: contactErr } = await sb
    .from("contacts")
    .upsert(
      {
        project_id: projectId,
        email: input.contact.email,
        website: input.contact.website,
        project_owner: input.contact.projectOwner,
        facebook_url: input.contact.facebookUrl,
        instagram_url: input.contact.instagramUrl,
        youtube_url: input.contact.youtubeUrl,
      },
      { onConflict: "project_id" }
    )
    .select()
    .single();
  if (contactErr) throw contactErr;

  // 3. Delete + reinsert contact phones
  await sb.from("contact_phones").delete().eq("contact_id", contact.id);
  if (input.contact.phones.length > 0) {
    const { error: phoneErr } = await sb.from("contact_phones").insert(
      input.contact.phones.map((p, i) => ({
        contact_id: contact.id,
        phone_number: p.phoneNumber,
        role: p.role,
        sort_order: i,
      }))
    );
    if (phoneErr) throw phoneErr;
  }

  // 4. Upsert project_details
  const { data: detail, error: detailErr } = await sb
    .from("project_details")
    .upsert(
      {
        project_id: projectId,
        num_towers: input.projectDetail.towers.length,
      },
      { onConflict: "project_id" }
    )
    .select()
    .single();
  if (detailErr) throw detailErr;

  // 5. Delete all towers (cascades to floor_plans) then reinsert
  await sb.from("towers").delete().eq("project_detail_id", detail.id);

  for (let i = 0; i < input.projectDetail.towers.length; i++) {
    const t = input.projectDetail.towers[i];
    const { data: tower, error: towerErr } = await sb
      .from("towers")
      .insert({
        project_detail_id: detail.id,
        tower_name: t.towerName,
        num_floors: t.numFloors,
        sort_order: i,
      })
      .select()
      .single();
    if (towerErr) throw towerErr;

    if (t.floorPlans.length > 0) {
      const { error: fpErr } = await sb.from("floor_plans").insert(
        t.floorPlans.map((fp, j) => ({
          tower_id: tower.id,
          image_url: fp.imageUrl,
          floor_label: fp.floorLabel,
          sort_order: j,
        }))
      );
      if (fpErr) throw fpErr;
    }
  }
}

export async function deleteProject(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) throw error;
}
