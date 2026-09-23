-- "I'm Interested" for paid events — there's no payment integration wired
-- up yet, so a paid event can't actually charge for a claimed slot. Instead
-- it collects the visitor's contact details and passes them to the event's
-- organiser (the business), reusing business_enquiries — the same table
-- the profile "Send Message" / admissions-enquiry form already writes to —
-- with the two extra fields an event-interest submission needs.

alter table public.business_enquiries
  add column if not exists sender_email text,
  add column if not exists event_id uuid references public.business_events(id) on delete set null;

create index if not exists business_enquiries_event_id_idx on public.business_enquiries (event_id);
