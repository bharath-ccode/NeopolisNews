import type Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

// Controlled vocabularies mirrored from lib/businessDirectory.ts and
// lib/projectsStore.ts — passed to the model as enums so it searches with
// real values instead of guessing category names.
const INDUSTRIES = ["Entertainment", "Events", "Food & Beverages", "Health & Wellness", "Retail", "Services", "Education"];
const LOCALITIES = [
  "Neopolis", "Kokapet", "Gandipet", "Financial District", "Rajendranagar",
  "Nanakramguda", "Nallagandla", "Tellapur", "Puppalaguda", "Narsingi", "Gachibowli",
  "Velimala", "Kollur", "Janwada", "Khanapur", "Vattinagulapally", "Mokila", "Manchirevula",
];
const PROJECT_TYPES = ["apartments", "independent_homes", "residential", "mixed_use", "commercial"];
const EVENT_TYPES = ["music_concert", "sports_run", "food_festival", "culture_art", "exhibition"];

export const CONCIERGE_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_businesses",
    description:
      "Search the live Neopolis business directory (clinics, schools, restaurants, gyms, cinemas, services, etc). Use for any question about finding a specific kind of business, checking if one exists, or getting its contact details. Only returns businesses actually listed on the platform — never invent one that isn't returned here.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search on business name, e.g. 'Apollo' or 'MSN Studio'." },
        industry: { type: "string", enum: INDUSTRIES, description: "Filter by industry category." },
        locality: { type: "string", enum: LOCALITIES, description: "Filter by locality/area." },
      },
    },
  },
  {
    name: "search_projects",
    description:
      "Search live real-estate project listings by locality, budget, and type. Use for any question about apartments, homes, or projects for sale — narrowing by area and affordability. Only returns real listed projects, with links to their pages.",
    input_schema: {
      type: "object",
      properties: {
        locality: { type: "string", enum: LOCALITIES, description: "Area to search in." },
        project_type: { type: "string", enum: PROJECT_TYPES, description: "Type of project." },
        budget_min: { type: "number", description: "Minimum budget in INR." },
        budget_max: { type: "number", description: "Maximum budget in INR." },
      },
    },
  },
  {
    name: "search_events",
    description:
      "Search upcoming events (concerts, runs, food festivals, exhibitions, culture & art) hosted by businesses on the platform. Only returns real, currently-listed upcoming events.",
    input_schema: {
      type: "object",
      properties: {
        event_type: { type: "string", enum: EVENT_TYPES, description: "Type of event." },
      },
    },
  },
];

interface ToolResultItem {
  [key: string]: unknown;
}

async function searchBusinesses(input: { query?: string; industry?: string; locality?: string }): Promise<ToolResultItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("businesses")
    .select("id, name, industry, types, address, contact_phone")
    .eq("status", "active")
    .order("name", { ascending: true })
    .limit(5);

  if (input.query?.trim()) q = q.ilike("name", `%${input.query.trim()}%`);
  if (input.industry) q = q.eq("industry", input.industry);
  if (input.locality) q = q.ilike("address", `%${input.locality}%`);

  const { data, error } = await q;
  if (error) return [];
  return (data ?? []).map((b) => ({
    name: b.name,
    industry: b.industry,
    types: b.types,
    address: b.address,
    phone: b.contact_phone,
    url: `${SITE_URL}/businesses/${b.id}`,
  }));
}

async function searchProjects(input: { locality?: string; project_type?: string; budget_min?: number; budget_max?: number }): Promise<ToolResultItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("projects")
    .select("id, project_name, locality, project_type, lifecycle_status, price_range_min, price_range_max")
    .order("project_name", { ascending: true })
    .limit(5);

  if (input.locality) q = q.eq("locality", input.locality);
  if (input.project_type) q = q.eq("project_type", input.project_type);
  if (input.budget_max != null) q = q.lte("price_range_min", input.budget_max);
  if (input.budget_min != null) q = q.gte("price_range_max", input.budget_min);

  const { data, error } = await q;
  if (error) return [];
  return (data ?? []).map((p) => ({
    name: p.project_name,
    locality: p.locality,
    project_type: p.project_type,
    status: p.lifecycle_status,
    price_range_min: p.price_range_min,
    price_range_max: p.price_range_max,
    url: `${SITE_URL}/real-estate/${p.id}`,
  }));
}

async function searchEvents(input: { event_type?: string }): Promise<ToolResultItem[]> {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  let q = admin
    .from("business_events")
    .select("id, name, event_type, event_date, start_time, is_free, ticket_price, businesses(name)")
    .eq("status", "active")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(5);

  if (input.event_type) q = q.eq("event_type", input.event_type);

  const { data, error } = await q;
  if (error) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((e: any) => ({
    name: e.name,
    event_type: e.event_type,
    date: e.event_date,
    time: e.start_time,
    organiser: e.businesses?.name ?? null,
    is_free: e.is_free,
    ticket_price: e.ticket_price,
    url: `${SITE_URL}/events/${e.id}`,
  }));
}

/** Runs a single tool_use block and returns its result as a JSON string,
 *  ready to go straight into a tool_result content block. Never throws —
 *  a failed lookup returns an empty array so the model can say "found
 *  nothing" instead of the whole turn erroring out. */
export async function runConciergeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "search_businesses": return JSON.stringify(await searchBusinesses(input));
      case "search_projects":   return JSON.stringify(await searchProjects(input));
      case "search_events":     return JSON.stringify(await searchEvents(input));
      default: return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: err instanceof Error ? err.message : "Tool failed" });
  }
}
