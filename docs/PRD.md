# PRD — WorldCup Predictor (MVP)

> **product-manager + testing-reality-checker consensus.** Final, cut-to-the-bone version.
> One sentence: *Predict World Cup 2026 scores, compete with friends in a private league, climb a leaderboard.*

---

## 1. Problem & Goal

During the World Cup, friends bet on scores in group chats with no scorekeeping. We give them a
dead-simple app: create a private league, everyone predicts every match, points are tallied
automatically, a leaderboard settles the argument.

**Success metric (the only one that matters):** the app runs on a real Android phone and **10+ friends
play one full match day together without it breaking.**

## 2. Target user

Football fans, 18–40, who already have a WhatsApp/Telegram friend group. Non-technical. They will not
read instructions. The invite flow must be one tap.

## 3. MVP scope — *exactly* these features

| # | Feature | Acceptance |
|---|---------|-----------|
| 1 | **Register / login** | Email + password (Supabase Auth). Username picked once at signup. |
| 2 | **Create league** | Name → league created, 6-char invite code + share link generated, creator auto-joined as member. |
| 3 | **Join league via link** | Open link or paste code → become a member → see its leaderboard. |
| 4 | **List matches** | Chronological list of WC2026 matches with teams, kickoff time, status (Upcoming / Live / Finished) and your prediction badge. |
| 5 | **Submit prediction** | Enter home & away score. Editable until kickoff; **locked after kickoff.** |
| 6 | **Leaderboard** | Per-league ranking: total points, exact-score count, matches played. |

## 4. Scoring rules (fixed, no config)

| Outcome | Points |
|---|---|
| Exact score (e.g. predict 2–1, result 2–1) | **5** |
| Correct result **and** correct goal difference (e.g. 1–0 vs 2–1) | **3** |
| Correct result only (winner or draw) | **2** |
| Wrong | **0** |

- One prediction **per user per match** (global). It counts in *every* league that user belongs to.
  This is the single most important simplification: we never store per-league predictions.
- Predictions lock at kickoff. No edits after.
- Points are computed server-side the moment a match result is entered (DB trigger). No client math is trusted.

## 5. Explicitly OUT of scope (do not build)

Chat · AI predictions · payments · ads · push notifications (phase 2) · social feed · fantasy/lineups ·
profile editing · password reset UI (Supabase email handles it) · live score auto-fetch · multiple
scoring profiles · web/iOS builds · animations beyond default.

## 6. How match results get entered (MVP reality)

No paid live-score API in the MVP. Results are entered by **you (the admin)** directly in the Supabase
table editor (or a `set_result()` SQL call) after each match. The DB trigger fans points out to all
predictions instantly. This is a deliberate trade: zero integration risk for ~5 seconds of manual work
per match. Phase 2 swaps in an API + cron without touching the app.

## 7. Risks (reality-checker) & mitigations

| Risk | Likelihood | Mitigation in MVP |
|---|---|---|
| Everyone opens app at kickoff → read spike | High | Supabase free tier handles it; matches list is a single cached query, leaderboard is one RPC. No N+1. |
| User edits prediction *after* kickoff | Certain someone tries | Lock enforced **in the DB** (RLS + trigger checks kickoff), not just UI. |
| Two devices, same account, racing edits | Medium | `upsert` on `(user_id, match_id)` unique key — last write wins, no duplicates. |
| Admin enters wrong score | Medium | Trigger recomputes on every result update, so fixing the score re-scores everyone automatically. |
| Timezones (kickoff shown wrong) | High annoyance | Store `kickoff` as `timestamptz` (UTC), render in device local time. |
| Invite link doesn't open app | High | Link also shows the 6-char code as fallback "paste this" path. |
| Supabase project paused (free tier, 7-day inactivity) | Low during tournament | N/A during active play; documented. |

## 8. Definition of Done (MVP)

- [ ] Fresh Android phone installs the dev build via Expo Go / `expo start --android`.
- [ ] New user registers, creates a league, gets a shareable link.
- [ ] Second user joins via that link and both appear on the leaderboard.
- [ ] Both predict a match; after kickoff the inputs are locked.
- [ ] Admin enters a result; both leaderboards update with correct points.
- [ ] No crash across 5+ concurrent users on one match day.
