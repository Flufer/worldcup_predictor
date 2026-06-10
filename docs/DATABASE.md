# Database Schema — WorldCup Predictor

> **engineering-backend-architect.** Minimal Postgres on Supabase. 5 tables, every access path guarded
> by RLS, all the dangerous logic in `security definer` functions. The runnable DDL is split into
> ordered migrations in [`supabase/migrations/`](../supabase/migrations) (0001 auth → 0002 leagues →
> 0003 matches/predictions → 0004 scoring → 0005 leaderboard).

## ER overview

```
auth.users (Supabase)
    │ 1:1
profiles ──────────┐
    │ 1:N          │ 1:N (owner)
    │              ▼
    │           leagues ──1:N──▶ league_members ◀──N:1── profiles
    │                                                        ▲
    └── 1:N ──▶ predictions ──N:1──▶ matches                 │
                    │                                        │
                    └──────────── belongs to user ───────────┘
```

## Tables

### `profiles`
| column | type | notes |
|---|---|---|
| id | uuid PK | = `auth.users.id` |
| username | text unique | shown on leaderboard |
| created_at | timestamptz | default now() |

### `leagues`
| column | type | notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| name | text | |
| invite_code | text unique | 6 chars, auto-generated, used in share link |
| owner_id | uuid | → profiles.id |
| created_at | timestamptz | |

### `league_members`
| column | type | notes |
|---|---|---|
| league_id | uuid | → leagues.id |
| user_id | uuid | → profiles.id |
| joined_at | timestamptz | |
| | | **PK (league_id, user_id)** — can't join twice |

### `matches`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| stage | text | 'Group A', 'Round of 16'… |
| home_team / away_team | text | |
| home_flag / away_flag | text | emoji flag (no asset pipeline) |
| kickoff | timestamptz | UTC; **the lock boundary** |
| home_score / away_score | int null | null = not played yet |
| status | text | 'scheduled' \| 'finished' (default 'scheduled') |

### `predictions`
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | → profiles.id |
| match_id | uuid | → matches.id |
| home_pred / away_pred | int | |
| points | int null | computed by trigger when match finishes |
| updated_at | timestamptz | |
| | | **UNIQUE (user_id, match_id)** — one pick per match |

## Row Level Security (the security model)

| Table | SELECT | INSERT / UPDATE |
|---|---|---|
| profiles | everyone (need usernames) | only your own row |
| leagues | members only (via membership) | insert: authed; owner set to you |
| league_members | rows of leagues you belong to | insert your own membership only |
| matches | everyone (public schedule) | **none** (admin via service role) |
| predictions | **only your own** | only your own **and** `now() < kickoff` |

Rivals' picks are never selectable. Standings come *only* from the aggregating RPC below.

## Functions (security definer — run with elevated rights, validated inside)

- **`join_league(code text)`** → finds league by `invite_code`, inserts caller into `league_members`,
  returns the league row. Lets users join without `SELECT` rights on other leagues.
- **`get_leaderboard(p_league_id uuid)`** → returns `username, total_points, exact_count, played` for
  each member, ordered. Aggregates `predictions.points`; never leaks individual picks.
- **`set_result(p_match_id uuid, p_home int, p_away int)`** → admin-only (checks a hardcoded admin
  list / service role); sets score + status, fires scoring.

## Triggers

- **`after insert on leagues`** → auto-insert owner into `league_members` (you're always in your own league).
- **`after update on matches` (when score set)** → `score_predictions()`: for every prediction of that
  match, compute points by the rules in [PRD §4](./PRD.md) and write `predictions.points`. Re-runs if a
  score is corrected, so leaderboards self-heal.

## Indexes

- `predictions (match_id)` and `predictions (user_id, match_id)` (unique) — scoring + upsert.
- `matches (kickoff)` — ordered match list.
- `league_members (league_id)` and `(user_id)` — membership lookups + leaderboard.
- `leagues (invite_code)` (unique) — join by code.

## Scoring function (pseudocode — real SQL in migrations/0004_scoring.sql)

```
result_diff = home_score - away_score
pred_diff   = home_pred  - away_pred
if home_pred == home_score and away_pred == away_score: 5      -- exact
elif sign(result_diff) == sign(pred_diff) and result_diff == pred_diff: 3  -- result + diff
elif sign(result_diff) == sign(pred_diff): 2                   -- result only
else: 0
```
