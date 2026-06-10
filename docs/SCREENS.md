# Screens — WorldCup Predictor

> **design-ui-designer + engineering-frontend-developer.** 6 screens. Dark, high-contrast, thumb-first.
> Every screen answers one question and has one primary action. No tab bar clutter — navigation is a
> stack plus a single 2-tab switch inside a league.

## Design tokens (see `lib/theme.ts`)

- **Background** `#0B1220` (deep navy) · **Surface** `#16203A` · **Border** `#24314f`
- **Primary** `#22C55E` (pitch green) · **Accent** `#FACC15` (trophy gold) · **Danger** `#EF4444`
- **Text** `#F8FAFC` / muted `#94A3B8`
- Radius 16, generous 48px tap targets, system font, one weight scale.

## Screen map

```
Splash (index)
  ├─ not authed ─▶ (1) Login / Register
  └─ authed ─────▶ (2) My Leagues
                       ├─ (3) Create League ─▶ share sheet ─▶ back to (4)
                       ├─ (3b) Join League (also deep-link target) ─▶ (4)
                       └─ (4) League  [ Matches | Leaderboard ]
                                └─ tap match ─▶ (5) Predict
```

## 1. Login / Register  `(auth)/login.tsx`
- One screen, toggle "Sign in ⇄ Create account".
- Fields: email, password, (+ username when registering).
- Primary button full-width. Errors inline under the field. Nothing else.

## 2. My Leagues  `(app)/leagues.tsx`
- Header "Your Leagues" + sign-out.
- List of league cards: name, member count, your rank chip.
- Empty state: friendly "No leagues yet" + two buttons.
- Two primary actions pinned bottom: **Create league** · **Join with code**.

## 3. Create League  `(app)/create-league.tsx`
- Single text field (league name) + **Create**.
- On success → success card showing invite code big + **Share invite** (opens native share sheet
  with link `worldcup://join/CODE` + readable code) and **Copy code**. → Go to league.

## 3b. Join League  `(app)/join.tsx`
- Code input (auto-filled when arriving from a deep link), **Join** button.
- On success → league screen. On bad code → inline error.

## 4. League  `(app)/league/[id].tsx`
- Title = league name + share icon (re-share invite).
- Segmented control: **Matches** | **Leaderboard**.
  - *Matches*: scrollable list (`MatchRow`): `🇧🇷 Brazil  2 – 1  Serbia 🇷🇸`, kickoff time/status,
    your-prediction badge (green if predicted, grey "—" if not, lock icon if kicked off). Pull to refresh.
  - *Leaderboard*: ranked rows — #, username, points (gold), exact-count, played. You are highlighted.

## 5. Predict  `(app)/match/[id].tsx`
- Big matchup header with flags.
- Two `ScoreStepper`s (− / number / +) for home & away, large and tappable.
- Status line: kickoff time, or "🔒 Locked — kicked off" / "Result: 2–1 · You scored +3".
- **Save prediction** primary button; disabled & inputs frozen once `now >= kickoff`.

## Component inventory (`components/`)
| Component | Use |
|---|---|
| `Button` | primary / secondary / danger, full-width, loading state |
| `Input` | labeled text field with inline error |
| `ScoreStepper` | −/value/+ numeric control for scores |
| `MatchRow` | one match line in lists |
| `EmptyState` | icon + text + action, for empty lists |
| `Segmented` | 2-option switch inside league screen |

## Interaction rules
- Optimistic disable on every async button (show spinner, prevent double-tap → prevents double-join/double-predict).
- Locked predictions render read-only, never a silent failure.
- Local time everywhere; relative "in 2h" where it helps.
