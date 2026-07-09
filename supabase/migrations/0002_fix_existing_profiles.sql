-- Fix existing users who registered before the profiles trigger was created.
-- Run this once in Supabase SQL Editor after 0001_initial_schema.sql.

insert into public.profiles (id, email)
select users.id, coalesce(users.email, '')
from auth.users
left join public.profiles profiles on profiles.id = users.id
where profiles.id is null;

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));