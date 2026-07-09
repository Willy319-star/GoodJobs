-- Allow custom city, source, and status values.
-- Run this once in Supabase SQL Editor after 0002_fix_existing_profiles.sql.

alter table public.applications drop constraint if exists applications_city_check;
alter table public.applications drop constraint if exists applications_source_check;
alter table public.applications drop constraint if exists applications_status_check;

alter table public.applications
  add constraint applications_city_check check (length(trim(city)) > 0),
  add constraint applications_source_check check (length(trim(source)) > 0),
  add constraint applications_status_check check (length(trim(status)) > 0);