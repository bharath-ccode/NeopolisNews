import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** POST { project_id, email, user_id? } — subscribe to construction updates. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { project_id, email, user_id } =
    body as { project_id?: string; email?: string; user_id?: string };

  if (!project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 });
  const cleanEmail = email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(cleanEmail))
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id, project_name")
    .eq("id", project_id)
    .single();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Upsert: re-subscribing reactivates a previously unsubscribed email
  const { error } = await admin
    .from("project_subscriptions")
    .upsert(
      { project_id, email: cleanEmail, user_id: user_id ?? null, is_active: true },
      { onConflict: "project_id,email" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, project_name: project.project_name }, { status: 201 });
}
