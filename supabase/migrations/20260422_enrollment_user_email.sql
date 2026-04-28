-- store user email at enrollment time so admin can query without joining auth.users
alter table session_enrollments add column if not exists user_email text;
