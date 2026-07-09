-- GoodJobs MVP database schema
-- Run this in the Supabase SQL editor or through Supabase CLI migrations.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  graduation_year integer,
  school text,
  major text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_graduation_year_check check (
    graduation_year is null or graduation_year between 2020 and 2100
  )
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,
  position text not null,
  category text not null,
  city text not null,
  source text not null,
  status text not null default '准备投递',
  apply_date date not null,
  job_url text,
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_company_name_check check (length(trim(company_name)) > 0),
  constraint applications_position_check check (length(trim(position)) > 0),
  constraint applications_category_check check (category in ('技术', '产品', '运营', '市场', '管培', '财务', '其他')),
  constraint applications_city_check check (length(trim(city)) > 0),
  constraint applications_source_check check (length(trim(source)) > 0),
  constraint applications_status_check check (length(trim(status)) > 0)
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null,
  event_date date not null,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint timeline_events_title_check check (length(trim(title)) > 0)
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  round text not null,
  interview_date timestamptz not null,
  questions text,
  answers text,
  notes text,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interviews_round_check check (length(trim(round)) > 0)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  title text not null,
  remind_at timestamptz not null,
  type text not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_title_check check (length(trim(title)) > 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create or replace trigger interviews_set_updated_at
before update on public.interviews
for each row execute function public.set_updated_at();

create or replace trigger reminders_set_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Foreign keys are not indexed automatically in Postgres. Index them explicitly.
create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_user_status_idx on public.applications(user_id, status);
create index if not exists applications_user_apply_date_idx on public.applications(user_id, apply_date desc);
create index if not exists applications_user_company_name_idx on public.applications(user_id, company_name);

create index if not exists timeline_events_user_id_idx on public.timeline_events(user_id);
create index if not exists timeline_events_application_id_idx on public.timeline_events(application_id);
create index if not exists timeline_events_user_event_date_idx on public.timeline_events(user_id, event_date desc);

create index if not exists interviews_user_id_idx on public.interviews(user_id);
create index if not exists interviews_application_id_idx on public.interviews(application_id);
create index if not exists interviews_user_interview_date_idx on public.interviews(user_id, interview_date desc);

create index if not exists reminders_user_id_idx on public.reminders(user_id);
create index if not exists reminders_application_id_idx on public.reminders(application_id);
create index if not exists reminders_user_remind_at_idx on public.reminders(user_id, remind_at asc);
create index if not exists reminders_open_tasks_idx on public.reminders(user_id, remind_at asc) where is_done = false;

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.timeline_events enable row level security;
alter table public.interviews enable row level security;
alter table public.reminders enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Users can read their own applications"
on public.applications for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can insert their own applications"
on public.applications for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their own applications"
on public.applications for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their own applications"
on public.applications for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can read their own timeline events"
on public.timeline_events for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can insert their own timeline events"
on public.timeline_events for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their own timeline events"
on public.timeline_events for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their own timeline events"
on public.timeline_events for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can read their own interviews"
on public.interviews for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can insert their own interviews"
on public.interviews for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their own interviews"
on public.interviews for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their own interviews"
on public.interviews for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can read their own reminders"
on public.reminders for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can insert their own reminders"
on public.reminders for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their own reminders"
on public.reminders for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their own reminders"
on public.reminders for delete
to authenticated
using (user_id = (select auth.uid()));