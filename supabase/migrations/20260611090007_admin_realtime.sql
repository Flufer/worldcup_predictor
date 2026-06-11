-- =============================================================================
-- 0007 · v1.1 Live Match Updates — admin role + realtime on matches.
-- Additive only. Scoring trigger (0004), auth, and existing RLS are unchanged.
-- After applying: flip is_admin for your account, e.g.
--   update public.profiles set is_admin = true where username = 'YOUR_USERNAME';
-- =============================================================================

-- ---------- admin role ----------
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- ---------- harden the result ingestion choke-point ----------
-- Every result write (admin screen now, API adapter later) goes through set_result.
-- Replace the hardcoded-email gate with a real, server-enforced admin flag.
create or replace function public.set_result(p_match_id uuid, p_home int, p_away int)
returns public.matches
language plpgsql security definer set search_path = public as $$
declare m public.matches;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  update public.matches
     set home_score = p_home, away_score = p_away, status = 'finished'
   where id = p_match_id
  returning * into m;
  return m;
end;
$$;

grant execute on function public.set_result(uuid, int, int) to authenticated;

-- ---------- realtime ----------
-- Publish match changes so clients update live (matches is public-read → authorized).
-- Guarded so re-running the migration is safe.
do $$
begin
  alter publication supabase_realtime add table public.matches;
exception
  when duplicate_object then null;   -- already published
  when undefined_object then null;   -- publication absent (non-Supabase env)
end $$;
