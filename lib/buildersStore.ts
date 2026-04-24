import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Builder {
  id: string;
  builderName: string;
  logoUrl: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BuilderInput = Omit<Builder, "id" | "createdAt" | "updatedAt">;

// ─── Mapping ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBuilder(row: any): Builder {
  return {
    id: row.id,
    builderName: row.builder_name,
    logoUrl: row.logo_url ?? null,
    address: row.address ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    website: row.website ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: BuilderInput) {
  return {
    builder_name: input.builderName,
    logo_url: input.logoUrl,
    address: input.address,
    email: input.email,
    phone: input.phone,
    website: input.website,
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getBuilders(): Promise<Builder[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("builders")
    .select("*")
    .order("builder_name");
  if (error) throw error;
  return (data ?? []).map(toBuilder);
}

export async function getBuilderById(id: string): Promise<Builder | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("builders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return toBuilder(data);
}

export async function createBuilder(input: BuilderInput): Promise<Builder> {
  const sb = createClient();
  const { data, error } = await sb
    .from("builders")
    .insert(toRow(input))
    .select()
    .single();
  if (error) throw error;
  return toBuilder(data);
}

export async function updateBuilder(id: string, input: BuilderInput): Promise<Builder> {
  const sb = createClient();
  const { data, error } = await sb
    .from("builders")
    .update(toRow(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toBuilder(data);
}

export async function getBuilderByEmail(email: string): Promise<Builder | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("builders")
    .select("*")
    .eq("email", email)
    .single();
  if (error || !data) return null;
  return toBuilder(data);
}

export async function deleteBuilder(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("builders").delete().eq("id", id);
  if (error) throw error;
}
