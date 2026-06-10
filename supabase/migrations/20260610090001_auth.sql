-- =============================================================================
-- 0001 · auth — profiles table tied to auth.users, RLS, auto-profile trigger.
-- Foundation migration: everything else references profiles(id).
-- =============================================================================

-- Not strictly required on Supabase (gen_random_uuid is a core pg_catalog function),
-- kept as a harmless safety net.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text unique not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- profiles: everyone can read usernames; you manage only your own row
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (id = auth.uid());

-- Auto-create a profile row when an auth user is created (username from metadata).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
