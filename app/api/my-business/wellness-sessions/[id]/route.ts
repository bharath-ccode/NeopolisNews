import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";
import { detectProvider } from "@/lib/videoProviders";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const { businessId, status, meeting_link, ...rest } = body ?? {};

  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const patch: Record<string, unknown> = { ...rest };

  if (status) patch.status = status;

  if (meeting_link !== undefined) {
    patch.meeting_link = meeting_link?.trim() || null;
    if (meeting_link) {
      const { provider, label } = detectProvider(meeting_link);
      patch.platform = provider;
      patch.platform_label = label;
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wellness_sessions")
    .update(patch)
    .eq("id", params.id)
    .eq("business_id", businessId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { error } = await admin
    .from("wellness_sessions")
    .delete()
    .eq("id", params.id)
    .eq("business_id", businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
