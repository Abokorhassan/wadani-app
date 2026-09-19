# Handover — picking this project up on another machine

**Last updated:** 2026-09-18 · **Repo:** `github.com/Abokorhassan/wadani-app` (branch `master`)

Everything needed to continue is in this repository. This file covers the parts
that are _not_ in the code: how to set up a fresh Mac, what was decided and why,
what is done, and what comes next.

Read in this order: [AGENTS.md](../AGENTS.md) → [docs/build-plan.md](build-plan.md) → this file.

---

## 1. What travels with the repo, and what doesn't

| Travels (in git)                                   | Stays on the old machine                           |
| -------------------------------------------------- | -------------------------------------------------- |
| App source, `docs/`, `design/`, `patches/`         | `.env` (gitignored — recreate from `.env.example`) |
| The build plan, decisions D1–D26, phase checklists | `node_modules/` (reinstall)                        |
| The screen designs and their HTML export           | `android/` and `ios/` (generated — see below)      |
| The `expo-modules-jsi` patch for newer Xcode       | Android SDK, NDK, emulator images                  |
|                                                    | Claude Code chat history and memory (see §5)       |

## 2. Setting up a new Mac

**Prerequisites**

- Node 22+ and Git
- Android Studio, with **SDK Platform Tools**, an emulator image, and **NDK 27.1.12297006**
  (Android Studio → SDK Manager → SDK Tools → check "Show Package Details")
- JDK 21 (Android Studio ships one; `zulu-21` also works)
- Xcode only if you want to try iOS — see the warning below

**Steps**

```bash
git clone https://github.com/Abokorhassan/wadani-app.git
cd wadani-app
npm install                 # postinstall applies patches/ automatically
cp .env.example .env        # defaults run the app entirely on mock data

# Generate the native projects (android/ and ios/ are not in git)
npx expo prebuild

# Point Gradle at your Android SDK
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# Build, install and launch (first build takes several minutes)
npx expo run:android
```

Afterwards the app stays installed, so day to day you only need `npm start`
(then press `a`), or relaunch the app and run `adb reverse tcp:8081 tcp:8081`.

**Checks before committing:** `npm run typecheck && npm run lint && npm test`

**iOS is currently blocked.** Expo SDK 57's `expo-modules-jsi` does not compile
under Xcode 26.1.1 / Swift 6.2.1. `patches/expo-modules-jsi+57.1.0.patch` fixes
two of the three errors; the third is in `JavaScriptRuntime.swift` and was left
alone rather than patched blind. Until Expo ships a fix, build iOS with **EAS
Build** (its toolchain matches the SDK) rather than locally. Full detail is in
build-plan §7, Phase 0. If the new machine has an **older Xcode**, local iOS
builds may simply work — worth trying.

## 3. Where the project stands

| Phase                   | State                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 — Foundations**     | Done. Expo SDK 57, Expo Router, design system, API layer with mock mode, i18n, tests, EAS profiles.                                                             |
| **1 — Onboarding**      | **Not started.** Welcome, registration and login are still Phase 0 shells; "Log in" creates a demo session with no password check. Blocked on decisions D1–D13. |
| **2 — Membership core** | Done. Home, My Card (QR, save to Photos, share), Payment history, Profile, Communications — all on mock data.                                                   |
| **3–6**                 | Not started. Donate, News & Events, Family and Contact open a "Coming soon" screen.                                                                             |

Nothing talks to a real backend yet: `EXPO_PUBLIC_API_MOCK=all` serves every
feature from fixtures. Endpoints can be switched to live one at a time — see
`src/api/mode.ts`.

**Designs:** [design/app-screens/](../design/app-screens/) holds the 20 approved
screen mockups (source), and [design/waddani-app-screens.html](../design/waddani-app-screens.html)
is a single-file version for sharing with people outside the project. The
canvas also lives at https://claude.ai/artifact/UPM4TjHMpYqHNqAg8F998m (only
reachable by people in the same organisation).

## 4. Decisions made so far

Agreed with the project owner during the sessions of 14–18 September 2026:

| Topic              | Decision                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile stack       | React Native via Expo. Owner's choice.                                                                                                                     |
| Backend            | Built by a separate developer; the app consumes a Postman collection. **Not received yet** — every path in `src/features/*/api.ts` is still a placeholder. |
| Payments           | Gateway integration deferred (Phase 6). v1 records payments manually.                                                                                      |
| The HTML prototype | `docs/waddani-membership.html` defines the _workflow_ only. The visual design was built from scratch.                                                      |
| Documentation      | No PRD. One decision-focused build plan, then code.                                                                                                        |
| Design direction   | Approved on 2026-09-17: the **light** Home and the **tall ticket-style** card. The dark Home and wallet card were the alternatives, and were not chosen.   |
| Type and colour    | Bricolage Grotesque, Figtree, IBM Plex Mono. Brand orange `#FE7B00` is a surface with dark text on it; olive green `#66783C` carries actions.              |
| Home tiles         | All six stay visible; unfinished ones open "Coming soon" (this overrides D20 in the build plan).                                                           |
| Phase order        | Phase 2 was built before Phase 1, at the owner's request.                                                                                                  |
| Commits            | **Claude does not commit.** It finishes the work and hands over a commit message to paste.                                                                 |

Decisions confirmed in Phase 2: D14 (the QR shows `qrPayload` from `GET /me`),
D15 (offline card), D16 (Save to Photos and Share), D17 (bell on Home).

## 5. Restarting Claude Code on the new machine

Chat history and Claude's memory notes are stored per machine under
`~/.claude/`, so they do not follow the repo. Nothing is lost: the build plan
and this file carry the context.

```bash
cd wadani-app
claude
```

Then say: _"Read AGENTS.md, docs/build-plan.md and docs/handover.md, then continue."_

The working preferences from the old machine, repeated here so they apply anywhere:

- **Don't commit.** Finish the work, then hand over the commit message as text.
- **Keep documentation lean** — a decision-focused plan and checklists, not PRDs.
- **The build plan is the source of truth** for scope, decisions and phases; keep its checkboxes current.

_(Optional: the old notes live in
`~/.claude/projects/-Users-<user>-Projects-Dumps-wadani/memory/` and can be
copied to the same path on the new machine.)_

## 6. What to do next

1. **Answer D1–D13** in build-plan §2 — they block Phase 1 (registration and
   login). Accepting the proposals as written is enough.
2. **Chase the Postman collection.** Build-plan §4.4 lists the endpoints the app
   expects, and §4.5 lists what to ask for alongside it (auth scheme, error
   format, date and money formats, a staging URL).
3. **Build Phase 1** — the registration wizard, real login, pending-review
   screen, and routing by membership status.
4. Still open: the social handle on the card (D18), the invite link
   `EXPO_PUBLIC_INVITE_URL` (D19), the FAQ copy (D21), Somali translations (D13),
   and the real contact details (D23).
