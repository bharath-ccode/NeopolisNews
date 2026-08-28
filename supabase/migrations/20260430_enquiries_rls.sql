-- RLS for business_enquiries, project_enquiries, enquiries (classifieds)
-- Public: INSERT only (submit an enquiry without being logged in)
-- Owner: SELECT their own enquiries (via businesses.owner_id or classifieds.user_id)
-- service_role bypasses RLS by default — admin retains full access

-- ─── business_enquiries ───────────────────────────────────────────────────────
alter table public.business_enquiries enable row level security;

create policy "anyone can submit a business enquiry"
  on public.business_enquiries for insert
  with check (true);

create policy "business owner can read own enquiries"
  on public.business_enquiries for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_enquiries.business_id
        and b.owner_id = auth.uid()
    )
  );

create policy "business owner can mark enquiry read"
  on public.business_enquiries for update
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_enquiries.business_id
        and b.owner_id = auth.uid()
    )
  );

-- ─── project_enquiries ────────────────────────────────────────────────────────
alter table public.project_enquiries enable row level security;

create policy "anyone can submit a project enquiry"
  on public.project_enquiries for insert
  with check (true);

create policy "builder can read own project enquiries"
  on public.project_enquiries for select
  using (
    exists (
      select 1 from public.projects p
      join public.builders b on b.id = p.builder_id
      where p.id = project_enquiries.project_id
        and b.email = (select email from auth.users where id = auth.uid())
    )
  );

create policy "builder can mark project enquiry read"
  on public.project_enquiries for update
  using (
    exists (
      select 1 from public.projects p
      join public.builders b on b.id = p.builder_id
      where p.id = project_enquiries.project_id
        and b.email = (select email from auth.users where id = auth.uid())
    )
  );

-- ─── enquiries (classifieds) ──────────────────────────────────────────────────
alter table public.enquiries enable row level security;

create policy "anyone can submit a classified enquiry"
  on public.enquiries for insert
  with check (true);

create policy "classified owner can read own enquiries"
  on public.enquiries for select
  using (
    exists (
      select 1 from public.classifieds c
      where c.id = enquiries.classified_id
        and c.user_id = auth.uid()
    )
  );

create policy "classified owner can mark enquiry read"
  on public.enquiries for update
  using (
    exists (
      select 1 from public.classifieds c
      where c.id = enquiries.classified_id
        and c.user_id = auth.uid()
    )
  );
