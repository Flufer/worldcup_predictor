<div align="center">

# ⚽️ World Cup Predictor

**Predict every match of the FIFA World Cup 2026, create private prediction leagues with friends, and battle it out on live leaderboards.**

![version](https://img.shields.io/badge/version-1.1.0-22C55E)
![platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)
![built with Expo](https://img.shields.io/badge/built%20with-Expo%20SDK%2054-000020?logo=expo&logoColor=white)
![backend](https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase&logoColor=white)

[**⬇️ Download the app**](#-download) · [Features](#-features) · [Screenshots](#-screenshots) · [Tech stack](#-tech-stack) · [Roadmap](#-roadmap)

</div>

---

## What is it?

World Cup Predictor turns the tournament into a game between you and your friends. Make a score
prediction for every match, earn points based on how close you were, and watch the standings update
**in real time** as results come in. Group stage to the final — it's all here.

## ✨ Features

- 🏆 **World Cup 2026 prediction leagues** — the full 48-team tournament: 12 groups + the knockout bracket.
- 👥 **Multiplayer leagues** — create a private league, share a one-tap invite link, and play with friends.
- 🎯 **Score predictions** — predict every match; picks lock automatically at kickoff.
- 📊 **Live leaderboards** — ranked standings with filters for **All**, **Groups**, and **Finals**.
- ⚡ **Real-time updates** — results, points and standings refresh instantly, no manual refresh.
- 🗂️ **Tournament view** — browse all **group standings** and the full **knockout bracket** in one tab.
- 🛡️ **Admin result management** — designated admins enter/correct final scores right from the phone.

**Scoring:** exact score = **5**, correct result + goal difference = **3**, correct result = **2**, wrong = **0**.
Points are computed on the server the moment a result is entered — never on the device.

## 📲 Download

> **Latest release: [v1.1.0](https://github.com/Flufer/worldcup_predictor/releases/tag/v1.1.0)** — Android APK

1. **Download the APK** from the [v1.1.0 release page](https://github.com/Flufer/worldcup_predictor/releases/tag/v1.1.0) (the `.apk` file under *Assets*).
2. **Allow installation from unknown sources** — when you open the APK, Android will ask for permission to install apps from this source. Tap *Settings → allow*, then go back.
3. **Install & open** — tap *Install*, then launch **World Cup Predictor** and create your account.

> Android only for now. No Google Play account or Expo Go needed.

## 📸 Screenshots

> _Screenshots coming soon._ Drop images into `docs/screenshots/` and they'll appear here.

| Leagues | Matches | Tournament | Leaderboard |
|:---:|:---:|:---:|:---:|
| _coming soon_ | _coming soon_ | _coming soon_ | _coming soon_ |

## 🧰 Tech Stack

- **React Native** — cross-platform mobile UI
- **Expo** (SDK 54, expo-router) — tooling, navigation & builds
- **TypeScript** — end-to-end type safety
- **Supabase** — Postgres, Auth, and Realtime (security enforced in the database via Row Level Security)

The app is a thin client that trusts nothing: all scoring and result logic lives server-side in Postgres.

## 🗺️ Roadmap

### v1.2
- Automatic qualification calculations
- Group standings enhancements

### v1.3
- Auto-filled knockout bracket
- Prediction analytics

### v2.0
- Friends system
- League sharing
- Notifications
- Public leagues

---

## 🛠️ Run it yourself (developers)

<details>
<summary>Local development & self-hosting setup</summary>

### 1. Backend (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. SQL editor → run every file in [`supabase/migrations/`](./supabase/migrations) **in order** (`0001` → `0007`),
   or `supabase db push` with the CLI.
3. SQL editor → run [`supabase/seed.sql`](./supabase/seed.sql) to load teams + the full WC2026 fixtures.
4. **Auth → Email**: turn *"Confirm email"* OFF for a friction-free test.
5. Make yourself an admin: `update public.profiles set is_admin = true where username = 'YOUR_USERNAME';`
6. **Database → Replication**: confirm `matches` is published under `supabase_realtime` (enables live updates).

### 2. App
```bash
cp .env.example .env      # paste your Supabase Project URL + anon key
npm install
npm run android           # or: npx expo start
```

### Build a shareable APK
See [`docs/RELEASE_v1.1.md`](./docs/RELEASE_v1.1.md) for the full EAS build & distribution guide.

### Project layout
```
app/         expo-router screens (auth, leagues, league/[id], match/[id], admin)
components/  Button, Input, ScoreStepper, MatchRow, GroupCard, TournamentView, StageFilter…
lib/         supabase client, auth + realtime + admin hooks, types, theme, helpers
supabase/    migrations/ (ordered DDL) + seed.sql
docs/        architecture, database, screens, release guide (+ historical design notes)
```

</details>

## 📚 Documentation
- [Architecture](./docs/ARCHITECTURE.md) · [Database schema](./docs/DATABASE.md) · [Screens](./docs/SCREENS.md)
- [Release & APK build guide](./docs/RELEASE_v1.1.md)
- Historical design notes: [PRD](./docs/PRD.md) · [Growth](./docs/GROWTH.md)

## License
Released for personal/educational use. World Cup 2026, team names and flags belong to their respective owners.
