-- Make business-media bucket publicly readable
-- (images are served via getPublicUrl — bucket must be public for them to load)

insert into storage.buckets (id, name, public)
values ('business-media', 'business-media', true)
on conflict (id) do update set public = true;

-- Allow anyone to read files from business-media
drop policy if exists "Public read on business-media" on storage.objects;
create policy "Public read on business-media"
  on storage.objects for select
  using (bucket_id = 'business-media');
