# Release v1.1.0 — Android APK / distribution guide

World Cup Predictor v1.1 (Live Match Updates). This is the step-by-step for producing a shareable
Android **APK** with EAS and handing it to test users (Telegram / Reddit) — **no Expo Go required**.

- App: **World Cup Predictor** · package `com.flufer.worldcuppredictor` · version `1.1.0` (versionCode 2)
- Stack: Expo SDK 54 · React Native 0.81 · Supabase (Postgres + Auth + Realtime)
- Build config: [`eas.json`](../eas.json) — `preview` → APK (internal), `production` → AAB (Play Store)

---

## 0. Prerequisites (one time)
1. A free **Expo account** → https://expo.dev/signup
2. EAS CLI (no global install needed — use `npx eas-cli@latest …`, shown below).
3. Supabase backend ready (see §3).

## 1. Log in to EAS
```bash
npx eas-cli@latest login
```
First build auto-creates the EAS project and writes `extra.eas.projectId` into `app.json` (accept the prompt).

## 2. Provide Supabase env to the cloud builder (the one required manual step)
`.env` is gitignored, so EAS's cloud builders don't see it. Register the two **public** client vars
(the anon key is meant to live in the client — security is enforced by Postgres RLS) once per profile:

```bash
# values come from Supabase → Settings → API
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL      --value "https://YOUR-PROJECT.supabase.co" --visibility plaintext
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR-ANON-KEY"                       --visibility plaintext
# repeat with --environment production before a store build
```
(Alternative: set them in the Expo dashboard → Project → Environment variables. Or build locally with
`npx eas-cli@latest build … --local`, which uses your local `.env`.)

## 3. Supabase must be ready before users install
- Run all migrations in order, including `supabase/migrations/20260611090007_admin_realtime.sql`.
- Run `supabase/seed.sql` (teams + fixtures).
- Auth → Email: turn **"Confirm email" OFF** for a friction-free public test.
- Make yourself admin: `update public.profiles set is_admin = true where username = 'YOUR_USERNAME';`
- Database → Replication: confirm `matches` is published under `supabase_realtime`.

## 4. Build the APK (shareable)
```bash
npx eas-cli@latest build -p android --profile preview
```
- Builds in the cloud; on first run it generates an Android **keystore** (let EAS manage it — keep it for future updates).
- When done, EAS prints a **download URL** for the `.apk` (also under expo.dev → your project → Builds).

## 5. Distribute
- Download the `.apk` from the build page and share the file/link in **Telegram / Reddit / DM**.
- Installers tap the APK → Android asks to allow **"Install from unknown sources"** for that app → Install.
- No Expo Go, no Play Store needed for this preview channel.

## 6. (Later) Play Store build
```bash
npx eas-cli@latest build -p android --profile production   # produces an .aab
npx eas-cli@latest submit -p android --latest              # after configuring Play Console
```

---

## Known limitations (v1.1)
- **Results are entered manually** by an admin (in-app Admin screen → `set_result`). No live football API yet (designed as a pluggable adapter for a later release).
- **Realtime** uses Supabase `postgres_changes`; comfortable for hundreds–low-thousands of concurrent users. Beyond that, switch to a Realtime **Broadcast** channel (documented in the v1.1 plan). Free tier caps ~200 concurrent realtime connections.
- **Knockout bracket** shows placeholder slots (e.g. "Winner Group A") until an admin fills the real teams — auto group standings (v1.2) and auto bracket fill (v1.3) are future work.
- **Android only** for this release. iOS needs a `bundleIdentifier` + Apple Developer account (not configured).
- App expects the Supabase env vars at build time (§2); without them the app shows a "Missing Supabase config" error on launch.

## Troubleshooting
- *"Missing Supabase config" on launch* → env vars not set for the build profile (§2).
- *Realtime not updating* → confirm `matches` is in the `supabase_realtime` publication and RLS allows public read (it does by default).
- *`eas build` asks about app version source* → `eas.json` sets `cli.appVersionSource: "local"`, so version comes from `app.json` (`1.1.0` / versionCode `2`).
