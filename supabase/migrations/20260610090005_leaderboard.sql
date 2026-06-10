-- =============================================================================
-- 0005 · leaderboard — aggregated standings RPC. Returns only summed points per
-- member, never individual picks. Depends on 0001/0002/0003 (+ is_member helper).
-- =============================================================================

create or replace function public.get_leaderboard(p_league_id uuid)
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
         coalesce(sum(p.points), 0)                          as total_points,
         coalesce(sum((p.points = 5)::int), 0)               as exact_count,
         coalesce(sum((p.points is not null)::int), 0)       as played
  from public.league_members lm
  join public.profiles pr on pr.id = lm.user_id
  left join public.predictions p on p.user_id = pr.id
  where lm.league_id = p_league_id
    and public.is_member(p_league_id)   -- caller must be a member to view
  group by pr.id, pr.username
  order by total_points desc, exact_count desc, pr.username asc;
$$;

grant execute on function public.get_leaderboard(uuid) to authenticated;
