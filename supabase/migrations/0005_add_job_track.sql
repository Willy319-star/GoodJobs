-- Add a lightweight job track so campus recruitment and internship records stay isolated.
-- Run this once in Supabase SQL Editor after 0004_remove_favorite_status.sql.

alter table public.applications
  add column if not exists track text not null default 'campus';

alter table public.timeline_events
  add column if not exists track text not null default 'campus';

alter table public.reminders
  add column if not exists track text not null default 'campus';

alter table public.applications
  drop constraint if exists applications_track_check,
  add constraint applications_track_check check (track in ('campus', 'internship'));

alter table public.timeline_events
  drop constraint if exists timeline_events_track_check,
  add constraint timeline_events_track_check check (track in ('campus', 'internship'));

alter table public.reminders
  drop constraint if exists reminders_track_check,
  add constraint reminders_track_check check (track in ('campus', 'internship'));

update public.timeline_events events
set track = applications.track
from public.applications applications
where events.application_id = applications.id;

create index if not exists applications_user_track_apply_date_idx on public.applications(user_id, track, apply_date desc);
create index if not exists applications_user_track_status_idx on public.applications(user_id, track, status);
create index if not exists timeline_events_user_track_event_date_idx on public.timeline_events(user_id, track, event_date desc);
create index if not exists reminders_user_track_remind_at_idx on public.reminders(user_id, track, remind_at asc);
create index if not exists reminders_track_open_tasks_idx on public.reminders(user_id, track, remind_at asc) where is_done = false;