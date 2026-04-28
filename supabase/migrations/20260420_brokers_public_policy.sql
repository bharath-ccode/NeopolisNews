-- Allow public read of approved broker profiles (needed for property listing joins)
create policy "approved brokers are publicly readable"
  on public.brokers for select
  using (status = 'approved');
