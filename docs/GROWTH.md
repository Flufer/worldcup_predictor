# Growth — Viral Invite Loop

> **marketing-growth-hacker.** The whole product *is* a viral loop: the game is worthless alone and
> only fun with friends, so every user is structurally motivated to recruit. Our job is to remove every
> gram of friction from invite → join.

## The core loop

```
   User creates a league
        │
        ▼
   Gets a 6-char code + share link  ──▶  pastes into WhatsApp/Telegram group
        │                                        │
        │                                        ▼
        │                              Friends tap link / paste code
        │                                        │
        ▼                                        ▼
   Leaderboard rivalry  ◀──────────  Friends register & join (k > 1 if each invites ≥1)
        │
        ▼
   "I'm winning / losing" → screenshots back into the group → more invites
```

**Viral coefficient driver:** a league is only fun at 4+ people, so the *creator* does our marketing
for us by spamming their group chat. We just make that one action effortless.

## What we build in the MVP to maximize k

1. **One-tap share** from the create-league success screen and the league header — native share sheet
   pre-filled with name + deep link + readable code. (Built.)
2. **Dual path invite**: deep link *and* a human-readable code in the same message, so it works even
   when the OS doesn't open the link. No dead ends. (Built.)
3. **Code pre-fill on deep link**: arriving via link drops the user straight on Join with the code
   already typed — they just tap Join. (Built.)
4. **Friction-free signup**: email + password + username, nothing else. No email confirmation wall in
   the demo (toggle "Confirm email" off in Supabase Auth for the friends test).

## Cheap, high-leverage nudges (Phase 2, ranked)

| Idea | Why it compounds | Cost |
|---|---|---|
| Push at kickoff: "3 friends predicted, you haven't" | FOMO → re-open → predict → stay | Low (expo-notifications) |
| Leaderboard screenshot button ("Share standings") | Turns rivalry into recruitment content | Low |
| "Invite to climb": empty/low league shows a Share CTA | More members = more fun = retention | Low |
| Post-match recap: "You beat 4 of 6 friends 🎉" | Bragging fuel back into the chat | Medium |
| Streak / "predicted every match" badge | Habit formation across the group stage | Medium |

## Metrics to watch (keep it to 3)

- **Invites sent per creator** (share taps) — top of loop.
- **Join conversion** (link/code opened → joined) — friction check.
- **D1/D-matchday retention** — did they come back for the next match.

Anything beyond these three is a distraction for an MVP. Instrument later; for the friends test, just
*watch the group chat* — that's your dashboard.
