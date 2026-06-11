# ⚽️ WorldCup Predictor

Predict FIFA World Cup 2026 scores, create private leagues with friends, climb a leaderboard.
Android-first MVP — **Expo SDK 54** (React Native + TypeScript) + **Supabase**. No AI, no payments, no ads.

> Team docs in [`docs/`](./docs): [PRD](./docs/PRD.md) · [Architecture](./docs/ARCHITECTURE.md) ·
> [Database](./docs/DATABASE.md) · [Screens](./docs/SCREENS.md) · [48h Plan](./docs/PLAN_48H.md) ·
> [Growth](./docs/GROWTH.md)

## Stack

- **Expo SDK 54 + expo-router 6 + TypeScript** (file-based navigation).
- **Supabase** — Postgres + Auth (email/password). Security is enforced in the database (Row Level
  Security + `security definer` RPCs); the app is a thin client and trusts nothing.

## Setup (≈10 min)

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. SQL editor → run the migrations **in order**:
   ```
   supabase/migrations/20260610090001_auth.sql
   supabase/migrations/20260610090002_leagues.sql
   supabase/migrations/20260610090003_matches_predictions.sql
   supabase/migrations/20260610090004_scoring.sql
   supabase/migrations/20260610090005_leaderboard.sql
   ```
   (Or, with the Supabase CLI: `supabase db push`.)
3. SQL editor → run [`supabase/seed.sql`](./supabase/seed.sql) for sample matches.
4. **Auth → Providers → Email**: for a friends test, turn **"Confirm email" OFF** so signups are instant.
5. Settings → API → copy the **Project URL** and **anon public key**.
6. (Admin) the `set_result` allowlist in `0004_scoring.sql` contains `mirdenisa251@gmail.com` — change it
   if you sign in with a different email.

### 2. App
```bash
cp .env.example .env      # then paste your URL + anon key
npm install
npm run android           # or: npx expo start  (press 'a' for Android / scan with Expo Go SDK 54)
```

## Scoring
| Outcome | Points |
|---|---|
| Exact score | 5 |
| Correct result + goal difference | 3 |
| Correct result | 2 |
| Wrong | 0 |

One prediction per user per match; it counts in every league you're in. Points are computed in the DB by
a trigger the moment a result is entered — never on the client.

## Project layout
```
app/         expo-router screens (auth, leagues, create, join, league/[id], match/[id])
components/  Button, Input, ScoreStepper, MatchRow, EmptyState, Segmented
lib/         supabase client, auth context, types, theme, scoring/format helpers
supabase/    migrations/ (ordered DDL) + seed.sql
docs/        PRD, architecture, database, screens, 48h plan, growth
```

## Live updates & admin (v1.1)
- Apply migration `…090007_admin_realtime.sql`, then make yourself an admin:
  `update public.profiles set is_admin = true where username = 'YOUR_USERNAME';`
- An **⚙︎ Admin** link appears on the Leagues screen for admins → enter/correct results from the phone.
- Results flow only through the `set_result()` RPC (admin-gated). The scoring trigger recomputes points
  and **Supabase Realtime** pushes the change to every client — leaderboard and matches update with no
  manual refresh. Confirm `matches` is enabled under Database → Replication (publication `supabase_realtime`).

## Notes
- Predictions lock at kickoff in the **database** (RLS), not just the UI.
- Times stored as UTC/with offset, rendered in the device's local time.
- A real football API can later drive `set_result()` via a scheduled Edge Function — no app changes.
