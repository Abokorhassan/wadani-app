# Handover — picking this project up on another machine

**Last updated:** 2026-09-25 · **Repo:** `github.com/Abokorhassan/wadani-app` (branch `master`)

Everything needed to continue is in this repository, except `.env` (see §1).
This file covers what is _not_ obvious from the code: how to set up a fresh Mac,
what was decided and why, where things stand, and the one open blocker.

Read in this order: [AGENTS.md](../AGENTS.md) → [build-plan.md](build-plan.md) →
[api-gaps.md](api-gaps.md) → this file.

---

## 1. What travels with the repo, and what doesn't

| Travels (in git)                                    | Stays on the old machine                     |
| --------------------------------------------------- | -------------------------------------------- |
| App source, `docs/`, `design/`, `patches/`          | **`.env`** — copy it by hand (see below)     |
| `api-contract/` — the backend's OpenAPI spec        | `node_modules/` (reinstall)                  |
| Build plan, decisions, phase checklists, `api-gaps` | `android/` and `ios/` (generated — see §2)   |
| The screen designs and their HTML export            | Android SDK, NDK, emulator images            |
|                                                     | Claude Code chat history and memory (see §7) |

**`.env` holds the AWS upload keys**, so it is gitignored on purpose. Move it
with AirDrop, a password manager or a USB stick — never through git, chat or
email. If you lose it, rebuild it from `.env.example` and ask the backend
developer for the keys again (and consider rotating them; see §5).

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
npm install                  # postinstall applies patches/ automatically
# put your copied .env in the project root now

npx expo prebuild            # generates android/ and ios/ (not in git)
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# Start the emulator with explicit DNS (see "Emulator gotchas" below)
~/Library/Android/sdk/emulator/emulator -avd <your_avd_name> -dns-server 8.8.8.8,1.1.1.1 &

npx expo run:android         # first build takes several minutes
```

`npx expo prebuild` and a full `run:android` are **required**, not optional:
this week added native modules (`react-native-webview` for card checkout,
`expo-file-system` for photo upload). A plain `npm start` against an old build
will crash when you reach those screens.

Day to day afterwards: `npx expo start`, then `adb reverse tcp:8081 tcp:8081`
and open the app.

**Checks before committing:** `npm run typecheck && npm run lint && npm test`
(currently 162 passing, 2 todo). `npm run verify:phases` prints each phase's
deliverables as a checklist.

**Emulator gotchas** — both cost hours this week:

1. **DNS goes stale.** Symptom: "We couldn't load the plans" while the API works
   fine from your Mac. Toggling airplane mode does not fix it. Start the emulator
   with `-dns-server 8.8.8.8,1.1.1.1`.
2. **Restarting the emulator doesn't restart the app.** Quick-boot restores a
   snapshot, including the app's old process with its broken network state. After
   any emulator restart run `adb shell am force-stop so.waddani.membership`, then
   relaunch. For a truly fresh boot add `-no-snapshot-load`.

**iOS builds locally and on EAS** since `expo-modules-jsi` 57.1.2 (Expo
57.0.33), which fixed the Xcode 26 compile errors. Do not patch that package:
the old `patches/expo-modules-jsi+57.1.0.patch` shipped prebuilt binaries with
an empty iPhone slice, so TestFlight build 1 crashed at launch
(`Library not loaded: ExpoModulesJSI.framework`) while the Simulator worked.
Before shipping an iOS build, check the device `.app` has a non-empty
`Frameworks/ExpoModulesJSI.framework/ExpoModulesJSI`.

## 3. Where the project stands

**Phases 0–4 are built.** Phase 5 (release) and 6 (renewal, push) are not started.

**The app now talks to the real backend** at `https://api.wp-membership-system.com`
(spec saved in `api-contract/`). What each feature uses:

| Feature                          | Status                                                              |
| -------------------------------- | ------------------------------------------------------------------- |
| Plans, periods, news, events     | **Live and verified** against real responses                        |
| Registration                     | **Live** — request is correct; blocked at payment (see §4)          |
| Login, card, payments, donations | Built to the spec; not verified live (no member account exists yet) |
| Card checkout (Sifalo)           | Built as an in-app browser; tested against a mock checkout page     |
| Photo upload                     | **Live and verified** — uploads straight to S3 from the app         |
| Family, notifications, support   | No backend endpoints; always use stand-in data (`src/api/mode.ts`)  |

The switch is `EXPO_PUBLIC_API_MOCK` in `.env`:

- `none` — everything live (**creates real members and charges real wallets**)
- `all` — everything mocked, self-consistent, nothing charged
- a list such as `auth,payments` — mock just those. **Don't mock `auth` while
  `membership` is live:** the fake token gets a 401 from the real card endpoint
  and the app signs you out two seconds after "registering".

## 4. Fixed: Sifalo said "No payment route"

**Fixed 2026-09-26** in platform commit `bc559e3`: Sifalo wants the local wallet
number (`634253226`), not `+252…`. The backend now converts it. Needs deploying,
then one live Waafi registration to confirm. History below.

Every live registration fails at the payment step with:

```json
{
  "error": {
    "message": "No payment route was found for the specified customer account. Please contact customer support for assistance",
    "details": { "code": "TRANSACTION_FAILED" }
  }
}
```

**It is not the app.** Proven on 2026-09-23/24:

- The request matches the spec field for field (and a test in
  `src/features/auth/register-body.test.ts` checks it against the saved spec).
- The identical request sent with **plain `curl`, no app involved**, gets the
  identical error.
- It failed **5 times across 2 different wallet numbers** (`+252634253226`,
  `+252634228267`), all `WAAFI`, all the same error. Payer phones are sent in
  international form (`+252…`).

**Why a Postman test showed a different error:** Postman used the Swagger example
payload — phone `+252611111111` is already a registered member, and the plan IDs
are all zeros. Either of those stops the request **before** payment, so it never
reaches Sifalo. Fix both and Postman gets "No payment route" too.

**Next step — with the backend developer / Sifalo:** ask whether the **WAAFI
channel (Zaad/Telesom numbers) is enabled on our Sifalo merchant account**. Trace
IDs to give them: `dc23c5c981ce731c5edc3c06810f22bc`,
`462a4e1c4e3708e3a880ab418afbf8d8`, `c6386369db9af668bac6a14e0ed308df`.
Also worth trying: eDahab with a real Dahabshiil number, to see whether it's
WAAFI-specific or account-wide.

## 5. Decisions made so far

Agreed with the project owner, 14–25 September 2026. The build plan's decision
table (D1–D26) has the detail; these are the ones that changed or were added.

| Topic               | Decision                                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack               | React Native via Expo (SDK 57).                                                                                                                                                                                           |
| Backend             | Built by a separate developer. OpenAPI spec in `api-contract/`; refresh it with the command in `api-contract/README.md` (needs the docs login).                                                                           |
| Payments            | **Everything goes through Sifalo**: WAAFI (covers Zaad/EVC/eSahal), EDAHAB, PREMIER_WALLET, CARD. No cash, no manual recording.                                                                                           |
| Card payments       | Sifalo's checkout opens **inside the app** (react-native-webview). The app catches the return URL, reads `sid`, and confirms the payment itself.                                                                          |
| Photo upload        | The app uploads to S3 directly with AWS keys in `.env`. **Owner's choice, knowing the keys ship inside the app.** Restrict the IAM user to `s3:PutObject` on `members/*` and rotate the key — it has been shared in chat. |
| Registration fields | Follow the API spec exactly. Photo, birth year, work, region **required**; email optional; phone is the identity.                                                                                                         |
| Approval step (D2)  | None — the API has none. A settled payment creates the member with a card straight away.                                                                                                                                  |
| Plan pricing (D5)   | The plan has a price range ($10–$50, member chooses). The amount does **not** depend on the period. **Not confirmed by the party yet.**                                                                                   |
| Errors (D7)         | Any failure is shown **on the payment step**, in a red banner, in the server's own words. The member is never moved back to step 1.                                                                                       |
| Family, RSVP        | Family shows "Coming soon"; RSVP removed. No endpoints for either.                                                                                                                                                        |
| Design              | Approved 2026-09-17: light Home, tall ticket-style card. Payment methods are a 2×2 grid with the providers' own logos.                                                                                                    |
| Documentation       | No PRD. One decision-focused build plan, then code.                                                                                                                                                                       |
| Commits             | **Claude does not commit.** It finishes the work and hands over a commit message to paste.                                                                                                                                |

## 6. Developer tools built for live testing

All are `__DEV__`-only and cannot reach a release build.

- **In-app API log**: the dark **"API" button** top-right on every screen lists
  each request — what was sent and what came back. Passwords are masked.
- **Console log**: every call prints as `[api] →` / `[api] ←`. Watch it with
  `adb logcat | grep "\[api\]"`.

## 7. Restarting Claude Code on the new machine

Chat history and Claude's memory are stored per machine under `~/.claude/`, so
they don't follow the repo. This file, the build plan and `api-gaps.md` carry
the context.

```bash
cd wadani-app
claude
```

Then say: _"Read AGENTS.md, docs/build-plan.md, docs/api-gaps.md and
docs/handover.md, then continue."_

Working preferences, repeated here so they apply anywhere:

- **Don't commit.** Finish the work, then hand over the commit message as text.
- **Keep documentation lean** — decisions and checklists, not PRDs.
- **Explain findings in simple, plain English.**
- **Verify, don't assume** — check real API responses and the actual payload
  before concluding anything.

_Optional:_ to bring the old conversation itself, copy
`~/.claude/projects/-Users-<old-user>-Projects-Dumps-wadani/` from the old Mac
to `~/.claude/projects/` on the new one, renamed to match the new project path
(the folder name is the project's full path with `/` replaced by `-`). Then run
`claude --resume` from the project folder. If the paths differ and it doesn't
show up, this file is enough.

## 8. What to do next

1. **Get the Sifalo WAAFI route fixed** (§4). Nothing else in registration can
   be finished until one live payment succeeds.
2. **Get a real test member account** (api-gaps question 8), so login, card,
   payment history and donations can be verified live.
3. **Confirm with the party** whether the membership period changes the price
   (api-gaps question 12).
4. **Rotate the AWS key** and restrict it to `s3:PutObject` on `members/*`.
5. Smaller items for the backend developer: shrink the 3 MB plan badge; add the
   plan icon to the card response; confirm the phone format it expects
   (api-gaps 10, 11, 13).
6. Then **Phase 5** (release: store accounts, privacy policy, EAS credentials)
   or **Phase 6** (renewal, push).
