-- Storage policies for the builder-assets bucket (project logos, banners,
-- floor plans, brochures). The bucket and its policies were set up by hand
-- and never checked in, so uploads from the admin/builder UIs can fail with
-- "new row violates row-level security policy" depending on which user is
-- signed in.
--
-- Model: public read (files are served via getPublicUrl), any signed-in
-- user may write. Admin/builder pages are the only surfaces that upload
-- here, and they are auth-gated. Idempotent — run in the Supabase SQL editor.

insert into storage.buckets (id, name, public)
values ('builder-assets', 'builder-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read on builder-assets" on storage.objects;
create policy "Public read on builder-assets"
  on storage.objects for select
  using (bucket_id = 'builder-assets');

drop policy if exists "Authenticated insert on builder-assets" on storage.objects;
create policy "Authenticated insert on builder-assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'builder-assets');

-- uploadImage uses upsert: true, which needs update as well as insert.
drop policy if exists "Authenticated update on builder-assets" on storage.objects;
create policy "Authenticated update on builder-assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'builder-assets')
  with check (bucket_id = 'builder-assets');

drop policy if exists "Authenticated delete on builder-assets" on storage.objects;
create policy "Authenticated delete on builder-assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'builder-assets');
