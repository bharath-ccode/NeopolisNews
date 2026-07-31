import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, companyName, phone, email, reraNumber, password } = body ?? {};

  if (!name || !phone || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if email already exists in auth.users — brokers must use a fresh email
  const { data: existing } = await admin.auth.admin.listUsers();
  const taken = (existing?.users ?? []).some(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (taken) {
    return NextResponse.json(
      { error: "This email is already registered. Please use a different email address for your broker account." },
      { status: 409 }
    );
  }

  // Also check brokers table in case of partial registration
  const { data: existingBroker } = await admin
    .from("brokers")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();
  if (existingBroker) {
    return NextResponse.json(
      { error: "A broker application with this email already exists." },
      { status: 409 }
    );
  }

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { name, role: "broker" },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create account" }, { status: 500 });
  }

  // Insert broker record — status defaults to 'pending'
  const { data: broker, error: dbError } = await admin
    .from("brokers")
    .insert({
      auth_user_id: authData.user.id,
      name,
      company_name: companyName || null,
      phone,
      email: email.toLowerCase(),
      rera_number: reraNumber || null,
    })
    .select("id")
    .single();

  if (dbError) {
    // Clean up orphan auth user
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ id: broker.id }, { status: 201 });
}
