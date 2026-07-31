import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import ClassifiedsClient, { type Classified } from "./ClassifiedsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Property Classifieds — NeopolisNews",
  description:
    "Residential, retail & office listings in the Neopolis district — from verified owners and licensed brokers.",
};

export default async function ClassifiedsPage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("classifieds")
    .select("*, broker:brokers(name, company_name, rera_number)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return <ClassifiedsClient initialListings={(data ?? []) as Classified[]} />;
}
