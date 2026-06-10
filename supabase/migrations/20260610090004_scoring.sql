-- =============================================================================
-- 0004 · scoring engine — the only trusted point math. A trigger recomputes
-- prediction points whenever a match result is set/corrected.
-- Depends on 0003 (matches, predictions).
--   5 = exact score | 3 = correct result + goal difference | 2 = correct result | 0 = wrong
-- =============================================================================

create or replace function public.calc_points(
  hs int, as_ int, hp int, ap int
) returns int language sql immutable as $$
  select case
    when hs is null or as_ is null then null
    when hp = hs and ap = as_ then 5
    when sign(hs - as_) = sign(hp - ap) and (hs - as_) = (hp - ap) then 3
    when sign(hs - as_) = sign(hp - ap) then 2
    else 0
  end;
$$;

-- When a match gets a result (or it's corrected), recompute every prediction's points.
create or replace function public.score_predictions() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.home_score is not null and new.away_score is not null then
    update public.predictions p
       set points = public.calc_points(new.home_score, new.away_score, p.home_pred, p.away_pred)
     where p.match_id = new.id;
  else
    update public.predictions p set points = null where p.match_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_score_predictions on public.matches;
create trigger trg_score_predictions
  after update of home_score, away_score on public.matches
  for each row execute function public.score_predictions();

-- Admin-only: set a match result and fire scoring. Edit the email allowlist below.
create or replace function public.set_result(p_match_id uuid, p_home int, p_away int)
returns public.matches
language plpgsql security definer set search_path = public as $$
declare m public.matches; caller_email text;
begin
  select email into caller_email from auth.users where id = auth.uid();
  if caller_email is null or caller_email not in ('mirdenisa251@gmail.com') then
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
