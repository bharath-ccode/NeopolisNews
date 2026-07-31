import { createClient } from "@/lib/supabase/client";

export interface Broker {
  id: string;
  authUserId: string | null;
  name: string;
  companyName: string | null;
  phone: string;
  email: string;
  reraNumber: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionNote: string | null;
  approvedAt: string | null;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBroker(row: any): Broker {
  return {
    id: row.id,
    authUserId: row.auth_user_id ?? null,
    name: row.name,
    companyName: row.company_name ?? null,
    phone: row.phone,
    email: row.email,
    reraNumber: row.rera_number ?? null,
    status: row.status,
    rejectionNote: row.rejection_note ?? null,
    approvedAt: row.approved_at ?? null,
    createdAt: row.created_at,
  };
}

export async function getBrokerByEmail(email: string): Promise<Broker | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("brokers")
    .select("*")
    .eq("email", email)
    .single();
  if (error || !data) return null;
  return toBroker(data);
}

export async function getBrokerById(id: string): Promise<Broker | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("brokers")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return toBroker(data);
}
