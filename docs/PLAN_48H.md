# 48-Hour Build Plan — WorldCup Predictor

> Solo dev, two focused days. Each block ends with something you can *see working*. Ship after Block 6;
> everything after is polish you can drop if time runs out.

## Pre-flight (30 min, before the clock)
- [ ] Create a Supabase project → copy **Project URL** + **anon key**.
- [ ] `npm install` in this repo, then `npx expo start --android` once to confirm the shell runs.
- [ ] Put URL + anon key in `.env` (see `.env.example`).

---

## DAY 1 — Backend + skeleton + auth (≈8h)

### Block 1 — Database (1.5h)
- [ ] Run the `supabase/migrations/*.sql` files in order (0001→0005) in the Supabase SQL editor
      (auth → leagues → matches/predictions → scoring → leaderboard).
- [ ] Run `supabase/seed.sql` to load sample WC2026 matches.
- [ ] Sanity check in Table editor: matches visible, RLS on, RPCs present.

### Block 2 — App boots & talks to Supabase (1h)
- [ ] `lib/supabase.ts` wired with env vars; AsyncStorage session.
- [ ] App launches on phone, no red screen.

### Block 3 — Auth (2h)
- [ ] `lib/auth.tsx` (AuthProvider + `useAuth`), root layout redirect guard.
- [ ] Login/Register screen: sign up creates `profiles` row (username), sign in works.
- [ ] Session persists across app restart.

### Block 4 — Leagues: create + list (2h)
- [ ] My Leagues screen lists your leagues (membership query).
- [ ] Create League screen → insert → owner auto-membership (trigger) → invite code shown + share sheet.

### Block 5 — Join flow + deep link (1.5h)
- [ ] Join screen calls `join_league(code)`.
- [ ] `worldcup://join/CODE` deep link pre-fills the code. Manual paste also works.
- [ ] **Checkpoint:** two accounts, one league, both are members. *Core viral loop done.*

---

## DAY 2 — Matches, predictions, leaderboard, hardening (≈8h)

### Block 6 — Matches + predictions (3h)  ← **MVP-complete here**
- [ ] League screen Matches tab: list from `matches`, ordered by kickoff, with status + your-pick badge.
- [ ] Predict screen: ScoreSteppers, `upsert` prediction, lock after kickoff (UI + DB both enforce).
- [ ] **Checkpoint:** predict a seeded match; edit it; confirm it's locked after a past-kickoff test row.

### Block 7 — Leaderboard + scoring proof (2h)
- [ ] Leaderboard tab calls `get_leaderboard(league_id)`.
- [ ] Enter a result via `set_result()` → trigger scores → leaderboard shows correct points.
- [ ] Verify all four scoring cases (5/3/2/0) with crafted predictions.

### Block 8 — Reality-check hardening (1.5h)
- [ ] Double-tap guards on create/join/predict (no duplicate rows).
- [ ] Timezone render check (kickoff in local time).
- [ ] Empty states + error toasts on every network call.
- [ ] Pull-to-refresh on matches + leaderboard.

### Block 9 — Real-device test with friends (1h)
- [ ] Publish dev build (`expo start --tunnel` or EAS dev build) to 3–5 friends.
- [ ] Everyone registers, joins one league, predicts the same match.
- [ ] You enter the result live → confirm leaderboards update for all.

---

## Cut list (drop these first if behind)
1. Deep link → keep only "paste code". (Saves ~45 min, share text still carries the code.)
2. Pull-to-refresh → manual "Refresh" button.
3. Segmented control polish → two plain buttons.
4. Empty-state art → plain text.

## Phase 2 backlog (NOT in 48h)
Push notifications at kickoff · live-score API + cron to auto-call `set_result` · Google login ·
password-reset screen · iOS build · per-stage filters · richer profile.
