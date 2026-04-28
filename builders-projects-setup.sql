-- ═══════════════════════════════════════════════════════════════════════════
-- NeopolisNews — Builders & Projects Schema
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS builders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_name  text NOT NULL,
  logo_url      text,
  address       text,
  email         text,
  phone         text,
  website       text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name          text NOT NULL,
  builder_id            uuid REFERENCES builders(id) ON DELETE SET NULL,
  total_land_area_acres numeric(10,2),
  total_units           integer,
  core_neopolis         boolean DEFAULT false,
  project_logo_url      text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  email           text,
  website         text,
  project_owner   text,
  facebook_url    text,
  instagram_url   text,
  youtube_url     text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_phones (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   uuid REFERENCES contacts(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  role         text CHECK (role IN ('sales', 'service', 'front_desk')),
  sort_order   integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_details (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  num_towers integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS towers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_detail_id uuid REFERENCES project_details(id) ON DELETE CASCADE,
  tower_name        text NOT NULL,
  num_floors        integer DEFAULT 1,
  sort_order        integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS floor_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tower_id    uuid REFERENCES towers(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  floor_label text,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ─── Updated-at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DO $$ BEGIN
  CREATE TRIGGER builders_updated_at BEFORE UPDATE ON builders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER project_details_updated_at BEFORE UPDATE ON project_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Row-Level Security ───────────────────────────────────────────────────────

ALTER TABLE builders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_phones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE towers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans     ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_builders"        ON builders        FOR SELECT USING (true);
CREATE POLICY "public_read_projects"        ON projects        FOR SELECT USING (true);
CREATE POLICY "public_read_contacts"        ON contacts        FOR SELECT USING (true);
CREATE POLICY "public_read_contact_phones"  ON contact_phones  FOR SELECT USING (true);
CREATE POLICY "public_read_project_details" ON project_details FOR SELECT USING (true);
CREATE POLICY "public_read_towers"          ON towers          FOR SELECT USING (true);
CREATE POLICY "public_read_floor_plans"     ON floor_plans     FOR SELECT USING (true);

-- Admin full access (authenticated Supabase users)
CREATE POLICY "admin_builders"        ON builders        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_projects"        ON projects        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_contacts"        ON contacts        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_contact_phones"  ON contact_phones  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_project_details" ON project_details FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_towers"          ON towers          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_floor_plans"     ON floor_plans     FOR ALL USING (auth.role() = 'authenticated');

-- ─── Storage bucket policies ──────────────────────────────────────────────────
-- NOTE: First create a public bucket called "builder-assets" in
--       Supabase Dashboard → Storage → New bucket → Name: builder-assets → Public: ON
-- Then run the policies below:

CREATE POLICY "public_read_builder_assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'builder-assets');

CREATE POLICY "auth_insert_builder_assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'builder-assets');

CREATE POLICY "auth_update_builder_assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'builder-assets');

CREATE POLICY "auth_delete_builder_assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'builder-assets');
