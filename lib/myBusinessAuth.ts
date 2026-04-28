import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export interface AuthedBusiness {
  userId: string;
  businessId: string;
  businessName: string;
}

export async function resolveBusinessAuth(
  req: NextRequest,
  businessId: string
): Promise<{ ok: true; data: AuthedBusiness } | { ok: false; status: number; error: string }> {
  const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "").trim();
  if (!token) return { ok: false, status: 401, error: "Unauthorized." };

  const admin = createAdminClient();
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) return { ok: false, status: 401, error: "Invalid or expired session." };

  const { data: biz, error: bizError } = await admin
    .from("businesses")
    .select("id, name, owner_email, owner_id")
    .eq("id", businessId)
    .or(`owner_email.eq.${user.email},owner_id.eq.${user.id}`)
    .single();

  if (bizError || !biz) return { ok: false, status: 404, error: "Business not found or access denied." };

  return { ok: true, data: { userId: user.id, businessId: biz.id, businessName: biz.name } };
}
