-- Add read state for in-app reminder notifications.
-- Run this once after 0005_add_job_track.sql.

alter table public.reminders
  add column if not exists read_at timestamptz;

create index if not exists reminders_unread_notifications_idx
on public.reminders(user_id, track, remind_at asc)
where is_done = false and read_at is null;