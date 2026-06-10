-- =============================================================================
-- 0003 · matches & predictions — fixtures and per-user score picks, with the
-- kickoff lock enforced in RLS. Depends on 0001 (profiles).
-- =============================================================================

create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  stage      text not null,
  home_team  text not null,
  away_team  text not null,
  home_flag  text not null default '',
  away_flag  text not null default '',
  kickoff    timestamptz not null,
  home_score int,
  away_score int,
  status     text not null default 'scheduled' check (status in ('scheduled','finished'))
);

create table if not exists public.predictions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  match_id   uuid not null references public.matches (id) on delete cascade,
  home_pred  int not null check (home_pred >= 0 and home_pred <= 99),
  away_pred  int not null check (away_pred >= 0 and away_pred <= 99),
  points     int,
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists idx_predictions_match on public.predictions (match_id);
create index if not exists idx_matches_kickoff    on public.matches (kickoff);

alter table public.matches     enable row level security;
alter table public.predictions enable row level security;

-- matches: public read; no client writes (admin via service role / set_result RPC)
drop policy if exists matches_read on public.matches;
create policy matches_read on public.matches for select using (true);

-- predictions: read only your own; write your own and only before kickoff
drop policy if exists predictions_read on public.predictions;
create policy predictions_read on public.predictions for select using (user_id = auth.uid());

drop policy if exists predictions_insert on public.predictions;
create policy predictions_insert on public.predictions for insert
  with check (
    user_id = auth.uid()
    and now() < (select kickoff from public.matches where id = match_id)
  );

drop policy if exists predictions_update on public.predictions;
create policy predictions_update on public.predictions for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and now() < (select kickoff from public.matches where id = match_id)
  );
