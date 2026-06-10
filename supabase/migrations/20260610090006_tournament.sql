-- =============================================================================
-- 0006 · tournament structure — teams table + group/stage metadata on matches,
-- and a stage filter on the leaderboard. Purely additive: existing rows,
-- leagues, predictions, scoring and the kickoff lock are untouched.
-- Depends on 0001/0002/0003/0005.
-- =============================================================================

-- ---------- teams ----------
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  flag        text not null default '',
  group_label text,                 -- 'A'..'L' for group-stage teams
  fifa_code   text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_teams_group on public.teams (group_label);

alter table public.teams enable row level security;

-- teams: public read (same model as matches); no client writes
drop policy if exists teams_read on public.teams;
create policy teams_read on public.teams for select using (true);

-- ---------- matches: stage metadata (display columns kept as-is) ----------
alter table public.matches add column if not exists stage_code  text;   -- group|r32|r16|qf|sf|third|final
alter table public.matches add column if not exists stage_order int;    -- 1..7 for sorting
alter table public.matches add column if not exists group_label text;   -- 'A'..'L' for group matches, null otherwise

create index if not exists idx_matches_stage on public.matches (stage_order, kickoff);

-- ---------- leaderboard: optional stage filter ----------
-- Arg list changes (adds p_stage), so drop the 1-arg version then recreate.
-- A 1-arg call still resolves via the default parameter.
drop function if exists public.get_leaderboard(uuid);

create or replace function public.get_leaderboard(p_league_id uuid, p_stage text default null)
returns table (
  user_id      uuid,
  username     text,
  total_points bigint,
  exact_count  bigint,
  played       bigint
)
language sql stable security definer set search_path = public as $$
  select pr.id as user_id,
         pr.username,
         coalesce(sum(p.points)
           filter (where p_stage is null or m.stage_code = p_stage), 0)            as total_points,
         coalesce(sum((p.points = 5)::int)
           filter (where p_stage is null or m.stage_code = p_stage), 0)            as exact_count,
         coalesce(sum((p.points is not null)::int)
           filter (where p_stage is null or m.stage_code = p_stage), 0)            as played
  from public.league_members lm
  join public.profiles pr on pr.id = lm.user_id
  left join public.predictions p on p.user_id = pr.id
  left join public.matches m on m.id = p.match_id
  where lm.league_id = p_league_id
    and public.is_member(p_league_id)   -- caller must be a member to view
  group by pr.id, pr.username
  order by total_points desc, exact_count desc, pr.username asc;
$$;

grant execute on function public.get_leaderboard(uuid, text) to authenticated;
