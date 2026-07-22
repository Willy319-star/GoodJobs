-- Add private invite codes for controlled GoodJobs signups.
-- Run this once after 0006_add_reminder_read_at.sql.
-- Actual invite code inserts should be kept private and must not be committed.

create table if not exists public.invite_codes (
  code text primary key,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  note text,
  constraint invite_codes_code_check check (code ~ '^GJ-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  constraint invite_codes_used_state_check check (
    (used_by is null and used_at is null) or (used_by is not null and used_at is not null)
  )
);

create index if not exists invite_codes_used_at_idx on public.invite_codes(used_at);

alter table public.invite_codes enable row level security;

create or replace function public.is_invite_code_available(invite_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.invite_codes
    where code = upper(trim(invite_code))
      and used_at is null
      and used_by is null
  );
$$;

create or replace function public.claim_invite_code(invite_code text, claim_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.invite_codes
  set used_by = claim_user_id,
      used_at = now()
  where code = upper(trim(invite_code))
    and used_at is null
    and used_by is null;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.is_invite_code_available(text) from public;
revoke all on function public.claim_invite_code(text, uuid) from public;

grant execute on function public.is_invite_code_available(text) to anon, authenticated;
grant execute on function public.claim_invite_code(text, uuid) to anon, authenticated;
