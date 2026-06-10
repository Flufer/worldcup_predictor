# Architecture — WorldCup Predictor

> **engineering-software-architect.** Principle: the smallest thing that survives a match day. No
> backend code of our own — Supabase *is* the backend. The app is a thin, trusted-nothing client.

## System diagram

```
┌─────────────────────────────┐         ┌──────────────────────────────────────┐
│   Android phone             │         │   Supabase project                    │
│                             │  HTTPS  │                                       │
│  Expo React Native (TS)     │ ──────▶ │  Auth (email+password, JWT)           │
│  - expo-router (file nav)   │         │  Postgres                              │
│  - @supabase/supabase-js    │ ◀────── │    tables + Row Level Security        │
│  - AsyncStorage (session)   │  JSON   │    trigger: score predictions         │
│                             │         │    RPC: join_league / get_leaderboard │
└─────────────────────────────┘         │    RPC: set_result (admin)            │
                                        └──────────────────────────────────────┘
```

There is **no middle tier.** The client talks to Supabase directly. Security is enforced by Postgres
Row Level Security + `security definer` RPCs — never by the client. This is the only way a solo dev
ships a trustworthy multiplayer app in 48h.

## Why these choices

| Decision | Reason | Rejected alternative |
|---|---|---|
| Expo (managed) | One command to run on a real phone; OTA later | Bare RN (native build pain) |
| expo-router | File-based nav = zero boilerplate | React Navigation hand-wiring |
| Supabase | Auth + Postgres + RLS + RPC in one free project | Firebase (NoSQL fights leaderboards), custom Node API (more to build/host) |
| Server-side scoring (trigger) | Client must never compute points; one source of truth | Client computes → cheating + drift |
| Global predictions (not per-league) | Halves the data model; a prediction is reused across leagues | Per-league predictions = 5× rows, sync bugs |
| Manual result entry | Zero API integration risk for MVP | Live API = auth, rate limits, mapping |

## Trust boundary

```
UNTRUSTED  | client UI (can be tampered)         → only enforces UX (disable inputs after kickoff)
-----------+-------------------------------------------------------------------------------------
TRUSTED    | Postgres RLS + triggers + RPC        → enforces: who reads what, kickoff lock, scoring
```

Concretely:
- A user can only `insert/update` **their own** prediction, and the RLS policy rejects writes when
  `now() >= match.kickoff`. UI lock is a courtesy; the DB is the law.
- Other users' raw predictions are **not** selectable. Standings come from `get_leaderboard()` (a
  `security definer` RPC that returns only aggregated points), so no one sees a rival's pick early.

## Data flow: one prediction

1. User types 2–1 on Match screen → `supabase.from('predictions').upsert({...})`.
2. RLS checks: row belongs to `auth.uid()` **and** kickoff not passed → allow.
3. Later, admin runs `set_result(match_id, 2, 1)` → trigger loops predictions for that match, writes
   `points` per the scoring rules, marks match `finished`.
4. Anyone opens Leaderboard → `get_leaderboard(league_id)` sums `points` over league members → ranked list.

## State management

No Redux/Zustand. Two things only:
- **Auth/session**: a tiny React Context (`AuthProvider`) wrapping Supabase's `onAuthStateChange`.
- **Server data**: fetched per-screen with `useEffect` + `supabase` calls, kept in local `useState`,
  pull-to-refresh to re-fetch. (Match day is read-heavy and forgiving; no cache library needed for MVP.)

## Folder layout

```
app/                       # expo-router routes
  _layout.tsx              # root: AuthProvider + redirect guard
  index.tsx                # splash → routes to login or leagues
  (auth)/login.tsx         # register + sign in (one screen, toggle)
  (app)/_layout.tsx        # authed stack
  (app)/leagues.tsx        # my leagues + create/join entry
  (app)/create-league.tsx
  (app)/join.tsx           # paste code / deep-link target
  (app)/league/[id].tsx    # league: Matches tab + Leaderboard tab
  (app)/match/[id].tsx     # submit/edit prediction
lib/
  supabase.ts              # configured client
  auth.tsx                 # AuthProvider + useAuth()
  scoring.ts               # shared point labels (display only; truth is in SQL)
  types.ts                 # DB row types
  theme.ts                 # design tokens
components/                # Button, Input, ScoreStepper, MatchRow, EmptyState
supabase/
  migrations/              # ordered DDL: auth, leagues, matches, scoring, leaderboard
  seed.sql                 # sample WC2026 matches
docs/                      # this folder
```

## Scaling note (reality-checker)

Free Supabase tier = plenty for a friends-group MVP (low hundreds of users, single-digit RPS at
kickoff). The only hot paths are `matches` (one indexed query) and `get_leaderboard` (indexed
aggregate). If it ever grows: add a materialized leaderboard refreshed on result entry. **Not now.**
