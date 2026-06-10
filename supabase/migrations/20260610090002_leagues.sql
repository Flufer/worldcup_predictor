-- =============================================================================
-- 0002 · leagues — leagues + membership tables, RLS, owner-auto-join trigger,
-- and the create/join RPCs. Depends on 0001 (profiles).
-- =============================================================================

create table if not exists public.leagues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null,
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.league_members (
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create index if not exists idx_members_league on public.league_members (league_id);
create index if not exists idx_members_user   on public.league_members (user_id);

alter table public.leagues        enable row level security;
alter table public.league_members enable row level security;

-- helper: is the current user a member of a league? (used by RLS + leaderboard)
create or replace function public.is_member(p_league_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.league_members
    where league_id = p_league_id and user_id = auth.uid()
  );
$$;

-- Auto-add league owner as the first member.
create or replace function public.add_owner_as_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.league_members (league_id, user_id)
  values (new.id, new.owner_id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_owner_member on public.leagues;
create trigger trg_owner_member
  after insert on public.leagues
  for each row execute function public.add_owner_as_member();

-- leagues: read leagues you belong to; create leagues you own
drop policy if exists leagues_read on public.leagues;
create policy leagues_read on public.leagues for select using (public.is_member(id));
drop policy if exists leagues_insert on public.leagues;
create policy leagues_insert on public.leagues for insert with check (owner_id = auth.uid());

-- league_members: read rows of leagues you're in; insert only your own membership
drop policy if exists members_read on public.league_members;
create policy members_read on public.league_members for select using (public.is_member(league_id));
drop policy if exists members_insert on public.league_members;
create policy members_insert on public.league_members for insert with check (user_id = auth.uid());

-- Create a league with a unique 6-char invite code (avoids collisions in one call).
create or replace function public.create_league(p_name text)
returns public.leagues
language plpgsql security definer set search_path = public as $$
declare
  lg   public.leagues;
  code text;
begin
  loop
    -- core functions only (md5 + gen_random_uuid live in pg_catalog), so this works
    -- regardless of search_path and needs no pgcrypto in the search path.
    code := upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.leagues where invite_code = code);
  end loop;
  insert into public.leagues (name, invite_code, owner_id)
  values (trim(p_name), code, auth.uid())
  returning * into lg;
  return lg;
end;
$$;

-- Join a league by its invite code (no SELECT rights on other leagues needed).
create or replace function public.join_league(code text)
returns public.leagues
language plpgsql security definer set search_path = public as $$
declare lg public.leagues;
begin
  select * into lg from public.leagues where invite_code = upper(trim(code));
  if not found then
    raise exception 'League not found' using errcode = 'P0002';
  end if;
  insert into public.league_members (league_id, user_id)
  values (lg.id, auth.uid())
  on conflict do nothing;
  return lg;
end;
$$;

grant execute on function public.create_league(text) to authenticated;
grant execute on function public.join_league(text)   to authenticated;
