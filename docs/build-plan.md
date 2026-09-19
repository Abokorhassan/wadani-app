# Waddani Membership App: Build Plan

**Status:** Draft v1 · 2026-09-15
**Functional reference:** [waddani-membership.html](waddani-membership.html). We follow its workflow and features but none of its visual design.
**Backend contract:** Postman collection from the backend developer (not received yet)
**Brand sources:** `wadani_orignal_logo.jpeg`, `wadani_white_logo.png`

How to use this doc:

- **§1 Functional inventory** is the "matches the HTML" checklist: every screen, field, rule and state.
- **§2 Decisions** covers places where the HTML is wrong, silent or contradicts itself. Each one has a proposal. Confirm or change it before the phase that needs it. Once confirmed, this doc replaces the HTML as the source of truth.
- **§3–§6** cover architecture, API integration, payments and the design system.
- **§7** lists the phases. **§8** lists the immediate next actions.

---

## 1. Functional inventory

### 1.1 Scope

**In v1:** onboarding (register, pending, login), home, digital card, payment history, donate (as a recorded payment), news & events with RSVP, family, contact & FAQs, communications, profile.

**Not in v1:** payment gateway integration, renewal flow, push notifications, a staff QR scanner app, the admin panel (backend team) and a feedback form.

### 1.2 Navigation map

```
Welcome ──► Register (4 steps) ──► Pending ──► Welcome
   │           │
   │           └─ "Already have an account? Log in" ─► Login
   └─────────► Login ──► Home
                 └─ "New here? Create an account" ─► Register

Signed-in tabs:  Home · Card · Payments · Profile
Home tiles:      My Card · Payments · Donate · News & Events · Family · Contact & FAQs
Home mini card ─► Card        Home "Invite" ─► native share sheet
```

- **On launch:** a saved session opens Home. No session opens Welcome.
- **Signed-in screens:** without a valid session they send the user to Welcome. See D2 for routing by membership status.

### 1.3 Screens

#### S1 Welcome

- Logo, "Welcome", "Choose an option to get started."
- Choice **Register new member** ("Create a new membership account") → S2
- Choice **I'm already a member** ("Log in to view your membership card") → S4

#### S2 Register: 4-step wizard

Shared behaviour:

- Step indicator: **Personal · Address · Plan · Payment**, showing current and completed steps.
- Buttons: **Back** (hidden on step 1) and **Next**. On the last step, Next reads **"Create account & get card"**.
- Next validates only the current step. Errors appear inline.
- Links: "Already have an account? Log in" → S4, and "Back" → S1.
- Draft handling: see D12. Step jumping: see D6.

**Step 1: Personal**

| Field             | Input                                                                              | Required | Rules                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Full name         | text                                                                               | ✔        |                                                                                                                           |
| Gender            | select: Male, Female                                                               | ✔        |                                                                                                                           |
| Phone             | phone                                                                              | ✔        | Must be unique (D7)                                                                                                       |
| WhatsApp          | phone                                                                              | –        |                                                                                                                           |
| Email             | email                                                                              | ✔        | Valid format (the HTML only checks it isn't empty). Must be unique: "An account with this email already exists." (D7, D8) |
| Year of birth     | number                                                                             | –        | See D9                                                                                                                    |
| Educational level | select: None, Primary, Secondary, Diploma, Bachelor's degree, Master's degree, PhD | ✔        |                                                                                                                           |
| Password          | password                                                                           | ✔        | At least 6 characters: "Password must be at least 6 characters."                                                          |

Missing required fields: "Please fill in name, gender, phone, email, educational level and password."

**Step 2: Address**

| Field   | Input | Required | Notes                                                                              |
| ------- | ----- | -------- | ---------------------------------------------------------------------------------- |
| Country | text  | ✔        | e.g. Somaliland                                                                    |
| City    | text  | ✔        | Placeholder should be a Somaliland city such as Hargeisa. The HTML says Mogadishu. |
| Address | text  | –        | Street or neighbourhood                                                            |

Missing required fields: "Please fill in country and city."

**Step 3: Plan**

- Plans are loaded from the API. Each plan has a name, an icon, a yearly USD price and a benefit list, with each benefit marked included (✓) or not included (✕).
- Plans appear in a switcher with the first plan preselected. The selected plan shows its name, "$X / year", a "Top benefits" heading and the benefit rows.
- **Membership period** is a select loaded from the API (e.g. 1 year, 2 years), with the first option preselected.
- Plans and periods each have a loading state and an error state with **Retry**: "Couldn't load plans. Retry" / "Couldn't load periods. Retry".
- Plan and period are both required: "Please select a membership plan and period."

**Step 4: Payment** (a manual payment record in v1, see §5)

| Field                     | Input                                                | Required | Notes                                                              |
| ------------------------- | ---------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| Payment method            | select: Cash, Zaad, eDahab, Dahabshiil, Premier Bank | ✔        | Defaults to Cash                                                   |
| Amount (USD)              | decimal                                              | ✔        | Prefilled from the plan price on entering this step, if empty (D5) |
| Account / phone paid from | text                                                 | ✔        |                                                                    |
| Reference / receipt #     | text                                                 | ✔        |                                                                    |

Missing required fields: "Please fill in amount, account and reference."

**Submit:** creates the membership application and a payment record with status **Pending**, clears the wizard and goes to S3.

#### S3 Pending

- Title: "We're reviewing your request"
- Text: "Thanks for registering with Waddani. Our team is reviewing your details and payment."
- Text: "We will notify you on your WhatsApp and email once your membership is approved."
- Button **Back to start** → S1

#### S4 Login

- One field, **Phone or email**. Phone numbers match regardless of formatting. Plus **Password**.
- **Forgot password?** link (D10).
- Errors:
  - Empty fields: "Please enter your phone/email and password."
  - Unknown account: "No account found for that phone/email."
  - Wrong password (D1)
- Success → S5.
- Links: "New here? Create an account" → S2, and "Back" → S1.

#### S5 Home (tab)

- Party header: logo, "XISBIGA WADDANI", "Somaliland National Party · Membership".
- "Hi, {first name}", then "Welcome back to your Waddani membership."
- **Mini card:** logo, full name, member ID and tier. Tapping it opens S6.
- **Invite banner:** "Invite your family & friends" / "Grow the Waddani community — share the app and get them registered."
  - **Invite** opens the native share sheet with "Join me as a Waddani member! Register in under a minute:" plus a link (D19).
- **Tiles:**

  | Tile           | Subtitle              | Opens |
  | -------------- | --------------------- | ----- |
  | My Card        | View & show your card | S6    |
  | Payments       | Payment history       | S7    |
  | Donate         | Support Waddani       | S8    |
  | News & Events  | Updates & RSVP        | S9    |
  | Family         | Manage family members | S10   |
  | Contact & FAQs | Help & WhatsApp chat  | S11   |

#### S6 My Card (tab)

- "My Card", then "Show this at check-in."
- The card shows:
  - party logo
  - member photo (D4)
  - full name and tier
  - "Valid until {Mon YYYY}"
  - QR code (D14) and member ID in the form `WD-######`
  - social footer: Facebook, X and Instagram, plus the handle "@WaddaniParty" (D18)
- **Save / Print** action (D16).

#### S7 Payment History (tab)

- "Payment History", then "Your membership payments."
- Each row shows the method, "{reference} • {date}", the USD amount and a status pill: **Completed** or **Pending**. Unknown statuses from the API show as a neutral pill.
- An empty state when there are no payments.

#### S8 Donate

- "Donate", then "Support Xisbiga Waddani's work in your community."
- Quick amounts **$5 · $10 · $25 · $50**, with $25 preselected. They fill the amount field, which stays editable.
- **Payment method:** the same 5 methods as registration.
- Validation: amount must be greater than 0, else "Please enter a valid amount."
- **Donate now** shows "Thank you for your ${amount} donation to Xisbiga Waddani!", then returns to S5 (D25).

#### S9 News & Events

- "News & Events", then "Stay up to date with Xisbiga Waddani."
- Tabs **News · Events**.
- **News item:** title, body text and date. It's a list only; the HTML has no detail screen.
- **Event:** date badge (month and day), title and "{time} · {venue}". An RSVP toggle switches between **RSVP** and **You're going**.

#### S10 Family

- "Family", then "Manage family members linked to your account."
- Each row shows an initials avatar, the name, "{relation} · {member ID}" and a status pill: **Active** or **Pending**.
- Add form:
  - **Full name** (required): "Please enter a name."
  - **Relation:** Spouse, Child, Parent or Sibling
  - **Add family member** adds the new person to the list as **Pending** (D24).

#### S11 Contact & FAQs

- "Contact & FAQs" (D22). Tabs **Contact · FAQs**.
- Contact details (D23):

  | Item         | Value                      |
  | ------------ | -------------------------- |
  | Phone        | +252 63 400 1122           |
  | Email        | info@waddani.so            |
  | Head office  | Waddani House, Hargeisa    |
  | Office hours | Sat–Thu, 8:00 AM – 4:00 PM |

- **Chat on WhatsApp** opens WhatsApp to +252 63 400 1122 with the message "Hi Waddani, I'd like some help with my membership."
- FAQs, 5 items (D21):
  - How do I renew my membership?
  - How does ZAAD payment work?
  - Can I add family members to my account?
  - My QR card isn't scanning, what do I do?
  - How do I get help or report an issue?

#### S12 Communications

- "Communications", then "Notifications sent to your WhatsApp and email."
- Each row shows an icon for the type, a title, the text and "Sent via WhatsApp & Email • {date}".
- Examples: Application under review, Payment received, Membership approved.
- Entry point: D17.

#### S13 Profile (tab)

- Photo or initials, full name and email.
- Rows: Member ID, Tier, Phone, Education, Member since ({Mon YYYY}).
- **Log out** clears the session and goes to S1.

### 1.4 Reference data (mock fixtures)

| Plan     | Icon | Price / year | Benefits                                                                                                                              |
| -------- | ---- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Standard | 📇   | $25          | ✓ Digital membership card & QR check-in · ✓ Party news & event invites · ✕ Vote in regional meetings · ✕ Priority support on WhatsApp |
| Silver   | ⭐   | $50          | ✓ Everything in Standard · ✓ Vote in regional meetings · ✓ Priority support on WhatsApp · ✕ Invite to leadership training             |
| Gold     | 👑   | $100         | ✓ Everything in Silver · ✓ Invite to leadership training · ✓ Direct line to regional office · ✓ Recognition at annual convention      |

- **Periods:** 1 year (12 months) and 2 years (24 months).
- **Member ID:** `WD-` followed by 6 digits, issued by the backend.
- **Sample content:** the news, events, notifications and payments in the HTML become fixture data.

---

## 2. Decisions

**Blocks** is the earliest phase that needs the answer. **Who** is the person or team who has to answer.

| #   | Topic                  | What the HTML does                                                                                             | Proposal                                                                                                                                                                                      | Who             | Blocks |
| --- | ---------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------ |
| D1  | Password check         | Login ignores the password, which is stored in plain text                                                      | Backend verifies passwords. The app never stores a password, not even in the registration draft.                                                                                              | Backend         | P1     |
| D2  | Login before approval  | Doesn't say                                                                                                    | Allow login and route by membership status: **pending** → S3; **rejected** → S3 with the reason and a WhatsApp link; **active** → Home; **expired** → Home with the card in an expired state. | You + Backend   | P1     |
| D3  | Dropped fields         | Gender, WhatsApp, birth year, country, city, address, period and payment account are collected but never saved | Send every collected field                                                                                                                                                                    | Backend         | P1     |
| D4  | Member photo           | Card and profile show a photo, but registration never asks for one                                             | Optional photo (camera or gallery) on Step 1, with initials as the fallback                                                                                                                   | You + Backend   | P1     |
| D5  | Amount vs period       | Prefills the 1-year price even when 2 years is chosen                                                          | Prefill price × years and keep the field editable, or use a price quote from the backend if one exists                                                                                        | You + Backend   | P1     |
| D6  | Step indicator         | Dots jump to any step without validation                                                                       | Only completed steps can be tapped                                                                                                                                                            | You             | P1     |
| D7  | Uniqueness             | Only email is checked, on the device, at Step 1                                                                | Backend enforces unique email **and** phone. Server errors go back to the right Step 1 field, or are shown earlier if there's an availability-check endpoint.                                 | Backend         | P1     |
| D8  | Email required         | Required                                                                                                       | Keep it required to match the HTML. Worth confirming, since many members may only have a phone or WhatsApp.                                                                                   | You / Party     | P1     |
| D9  | Year of birth          | Optional, not validated                                                                                        | Optional. If filled in, it must be a 4-digit year that isn't in the future. Minimum age still to be decided.                                                                                  | Party           | P1     |
| D10 | Forgot password        | Shows a "not implemented" alert                                                                                | If the backend has a reset flow: phone/email → OTP → new password. If not, the link opens WhatsApp support.                                                                                   | Backend         | P1     |
| D11 | Consent                | No consent checkbox (prototype code suggests one existed)                                                      | Required "I agree to the membership terms & privacy policy" on Step 4, since party membership is sensitive personal data                                                                      | You / Party     | P1     |
| D12 | Draft on exit          | The wizard resets every time it opens                                                                          | Keep the draft (without the password) if the app closes mid-registration. Tapping Back to Welcome asks "Discard registration?"                                                                | You             | P1     |
| D13 | Language               | English only                                                                                                   | English and Somali at launch. i18n is set up in Phase 0 either way.                                                                                                                           | You / Party     | P0     |
| D14 | QR contents            | A static image                                                                                                 | Backend issues a signed token, not just the member ID, so cards can't be forged. Who scans at events is out of scope for this app.                                                            | Backend         | P2     |
| D15 | Offline card           | Doesn't say                                                                                                    | Cache the card and QR so they open without internet at venues                                                                                                                                 | You             | P2     |
| D16 | Save / Print           | Calls the browser's print                                                                                      | **Save to Photos** and **Share**                                                                                                                                                              | You             | P2     |
| D17 | Communications access  | The screen exists but nothing links to it                                                                      | Bell icon in the Home header                                                                                                                                                                  | You             | P2     |
| D18 | Social handles         | f / X / Instagram · @WaddaniParty                                                                              | Confirm the real accounts                                                                                                                                                                     | Party           | P2     |
| D19 | Invite link            | Uses the current web page URL                                                                                  | A store or landing-page link, to be confirmed                                                                                                                                                 | You / Party     | P2     |
| D20 | Unfinished tiles       | –                                                                                                              | Hide a Home tile until its phase ships                                                                                                                                                        | You             | P2     |
| D21 | FAQ copy               | Mentions a "Renew" button and instant Zaad verification, neither of which exists                               | Rewrite the FAQs for v1 (manual payments, no renewal). Load them from the API if an endpoint exists.                                                                                          | Party / Backend | P3     |
| D22 | Contact vs Feedback    | The screen is titled "Contact & Feedback" with feedback styles, but has no form                                | No feedback form in v1. Title it "Contact & FAQs" and make contact rows tappable (call, email, map).                                                                                          | You             | P3     |
| D23 | Contact details source | Hard-coded                                                                                                     | From an API config endpoint if one exists, otherwise app constants. Confirm the real values.                                                                                                  | Backend / Party | P3     |
| D24 | Family member model    | Name and relation only; gets an ID; moves from Pending to Active                                               | v1 matches the HTML. Ask the backend: do dependents need birth year or gender, a payment, or their own card? (The FAQ says they each get one.)                                                | Backend / Party | P4     |
| D25 | Donation handling      | Only shows an alert                                                                                            | Record a donation (method and amount, status Pending), then show a thank-you screen. Non-cash methods collect account and reference the same way as Step 4.                                   | Backend         | P4     |
| D26 | Renewal & expiry       | Not covered                                                                                                    | The renewal flow ships with payment gateways (P6). Until then, an expired card shows "Contact the office to renew".                                                                           | You             | P6     |

---

## 3. Architecture

### 3.1 Stack

Pin exact versions at Phase 0 using `create-expo-app` and `npx expo install`.

| Concern             | Choice                                                                                  | Why                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Framework           | **Expo** (latest SDK, development builds, New Architecture)                             | React Native's recommended framework. EAS handles builds, so there's no native tooling to maintain. |
| Language            | TypeScript, strict                                                                      |                                                                                                     |
| Navigation          | **Expo Router** with route groups and protected routes                                  | File-based. The auth gate lives in one place.                                                       |
| Server state        | **TanStack Query** with an MMKV persister                                               | Caching, retries and offline card/profile                                                           |
| Client state        | **Zustand**                                                                             | Session and registration draft only                                                                 |
| Forms               | **react-hook-form + zod**                                                               | Validation per step, typed values                                                                   |
| HTTP                | Thin typed wrapper over `fetch`                                                         | Few dependencies, full control over auth and errors                                                 |
| API data validation | **zod**                                                                                 | Checks backend data at the boundary                                                                 |
| Secure storage      | expo-secure-store                                                                       | Tokens                                                                                              |
| Local storage       | react-native-mmkv                                                                       | Query cache and registration draft                                                                  |
| Styling             | `StyleSheet` + design tokens + `useTheme` hook                                          | Our own design system, no UI kit                                                                    |
| Icons               | lucide-react-native (react-native-svg)                                                  |                                                                                                     |
| i18n                | i18next + react-i18next + expo-localization                                             |                                                                                                     |
| Media               | expo-image, expo-image-picker, react-native-view-shot, expo-media-library, expo-sharing | Photo upload, saving the card                                                                       |
| QR                  | react-native-qrcode-svg                                                                 |                                                                                                     |
| Testing             | Jest + React Native Testing Library; **Maestro** for E2E                                |                                                                                                     |
| Builds & release    | EAS Build and Submit, with `development` / `preview` / `production` profiles            |                                                                                                     |
| Crash reporting     | Sentry (Phase 5)                                                                        |                                                                                                     |

### 3.2 Project structure

```
wadani/
├── src/
│   ├── app/                          # Expo Router: routes only
│   │   ├── _layout.tsx               # providers (query, theme, i18n) + auth gate
│   │   ├── index.tsx                 # entry redirect
│   │   ├── gallery.tsx               # dev-only component gallery
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── welcome.tsx           # S1
│   │   │   ├── register.tsx          # S2 (hosts the wizard)
│   │   │   ├── pending.tsx           # S3
│   │   │   └── login.tsx             # S4
│   │   └── (app)/
│   │       ├── _layout.tsx
│   │       ├── (tabs)/
│   │       │   ├── _layout.tsx       # Home · Card · Payments · Profile
│   │       │   ├── home.tsx          # S5
│   │       │   ├── card.tsx          # S6
│   │       │   ├── payments.tsx      # S7
│   │       │   └── profile.tsx       # S13
│   │       ├── donate.tsx            # S8
│   │       ├── news-events.tsx       # S9
│   │       ├── family.tsx            # S10
│   │       ├── contact.tsx           # S11
│   │       └── communications.tsx    # S12
│   ├── api/
│   │   ├── client.ts                 # base URL, auth header, timeout, 401 handling
│   │   ├── errors.ts                 # ApiError normalisation
│   │   ├── mode.ts                   # live/mock switch per feature
│   │   └── mock/                     # latency and error simulation helpers
│   ├── features/
│   │   ├── auth/                     # login, logout, refresh, session store
│   │   ├── registration/             # wizard steps, step schemas, draft store
│   │   ├── membership/               # me, card, plans, periods
│   │   ├── payments/                 # history + methods/ registry (§5)
│   │   ├── donations/
│   │   ├── news-events/
│   │   ├── family/
│   │   ├── support/                  # contact, FAQs, WhatsApp link
│   │   └── notifications/            # communications
│   │       # every feature has the same shape:
│   │       # index.ts          public exports
│   │       # api.ts            live endpoint functions
│   │       # api.mock.ts       same functions, backed by fixtures
│   │       # schemas.ts        zod schemas for backend data (DTOs)
│   │       # mappers.ts        DTO → domain model
│   │       # hooks.ts          TanStack Query hooks
│   │       # components/
│   ├── design-system/
│   │   ├── tokens/                   # colors, typography, spacing, radii, elevation
│   │   ├── theme.ts
│   │   └── components/
│   ├── lib/                          # storage, secure-storage, env, format, share, linking
│   └── i18n/                         # en.json, so.json
├── assets/brand/                     # logos, app icon, splash
├── api-contract/                     # Postman collection (committed)
├── e2e/                              # Maestro flows
└── docs/
```

**Rules**

1. Files in `app/` only compose feature components. No data fetching or business logic.
2. A feature exposes a public `index.ts`. Other features import only from that file.
3. Screens use domain types from `mappers.ts`, never raw backend data.
4. Every user-facing string goes through i18n.
5. `design-system/` never imports from `features/`.

### 3.3 Domain model

These are app-side types. Mappers convert whatever shape the backend returns into these.

```ts
type MembershipStatus = 'pending' | 'active' | 'rejected' | 'expired';

interface Member {
  id: string; // "WD-482913"
  fullName: string;
  gender: 'male' | 'female';
  phone: string;
  whatsapp?: string;
  email: string;
  birthYear?: number;
  education: EducationLevel;
  address: { country: string; city: string; line?: string };
  photoUrl?: string;
  status: MembershipStatus;
  rejectionReason?: string;
  plan: Pick<Plan, 'id' | 'name'>;
  memberSince?: string; // ISO date
  validUntil?: string; // ISO date
  qrPayload?: string; // D14
}

interface Plan {
  id: string;
  name: string;
  icon: string;
  priceUsd: number;
  benefits: { text: string; included: boolean }[];
}
interface MembershipPeriod {
  id: string;
  label: string;
  months: number;
}
interface Payment {
  id: string;
  method: PaymentMethodId;
  amountUsd: number;
  reference: string;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'unknown';
}
interface NewsItem {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
}
interface Event {
  id: string;
  title: string;
  startsAt: string;
  venue: string;
  isGoing: boolean;
}
interface FamilyMember {
  id: string;
  memberId?: string;
  fullName: string;
  relation: 'spouse' | 'child' | 'parent' | 'sibling';
  status: 'pending' | 'active';
}
interface Notification {
  id: string;
  type: 'review' | 'payment' | 'approved' | 'other';
  title: string;
  body: string;
  channels: ('whatsapp' | 'email')[];
  sentAt: string;
}
```

### 3.4 Session & routing

```
App launch
  └─ read token from SecureStore
       ├─ no token ───────────────► (auth)/welcome
       └─ token ─► GET /me
            ├─ 401 ───────────────► clear session ─► (auth)/welcome
            ├─ status: pending ───► (auth)/pending
            ├─ status: rejected ──► (auth)/pending (with reason)
            └─ active / expired ──► (app)/(tabs)
```

- The session store holds the tokens (in SecureStore) and a short member summary.
- **Logout** clears SecureStore, the query cache and the persisted cache.
- Routing uses Expo Router protected routes, so no screen checks auth on its own.

### 3.5 State

- **Server data** uses TanStack Query. Keys: `['me']`, `['plans']`, `['periods']`, `['payments']`, `['notifications']`, `['news']`, `['events']`, `['family']`.
- **Mutations** invalidate the keys they affect. RSVP updates `['events']` immediately and rolls back if the request fails.
- **Offline:** only `['me']` (card and profile) is saved to MMKV.
- **Client state** uses Zustand: `session`, plus `registrationDraft`, which is saved locally but never includes the password.

### 3.6 Registration form

- One react-hook-form instance spans all 4 steps. Each step has its own zod schema, and the schemas are merged for the final submit.
- **Next** runs `trigger(fieldsOfCurrentStep)`.
- If the server rejects a field (e.g. email already taken), the error is attached to that field and the wizard jumps back to its step.
- Whether the backend takes one `register` call with the payment included, or `register` followed by a payment call, stays hidden inside `features/registration/api.ts`.

---

## 4. API integration

### 4.1 Principles

- **The contract** is the Postman collection, committed to `api-contract/`. When the backend developer sends an update, replace the file; the git diff shows what changed.
- **Validate at the boundary.** Every response is parsed with zod. A parse failure is a contract bug: in development it shows a loud error, and in production a generic error that gets reported.
- **Mappers** isolate backend field names. If the backend renames a field, only one mapper changes.
- **Ask for OpenAPI.** If the backend framework can export it, we generate types (`openapi-typescript`) instead of writing zod schemas by hand.

### 4.2 HTTP client

- The base URL comes from `EXPO_PUBLIC_API_URL`. Separate URLs per EAS profile (dev, staging, production).
- The auth header is added from the session.
- Requests time out after 15 seconds, since mobile connections can be poor.
- On a **401**, the client tries one token refresh (if the backend supports it). If that fails, the user is logged out and sent to Welcome.
- Queries retry network errors twice. Mutations never retry automatically.
- All failures are normalised to one error type:

```ts
type ApiError =
  | { kind: 'network' } // offline, timeout
  | { kind: 'unauthorized' } // 401 after refresh
  | { kind: 'validation'; fieldErrors: Record<string, string>; message?: string } // 400 / 422
  | { kind: 'not_found' }
  | { kind: 'server'; status: number; message?: string }; // 5xx, unexpected
```

### 4.3 Mock mode

- Each feature has `api.ts` (live) and `api.mock.ts`. Both export the same functions.
- `EXPO_PUBLIC_API_MOCK` chooses which one is used:
  - `all` mocks everything
  - `none` uses the live backend for everything
  - a comma-separated list of features (e.g. `family,donations`) mocks only those, so features can go live one at a time as endpoints land
- Mock data comes from §1.4 and the collection's example responses. Mocks add latency and have a switch to force errors, so loading and error states get tested.

### 4.4 Endpoints the app expects

Paths are placeholders. Fill in **Actual** from the Postman collection.

| #   | Purpose                                                                   | Suggested                              | Actual | Used by         | Phase |
| --- | ------------------------------------------------------------------------- | -------------------------------------- | ------ | --------------- | ----- |
| 1   | Register member (with payment details, photo)                             | `POST /auth/register`                  |        | S2              | 1     |
| 2   | Log in with phone or email                                                | `POST /auth/login`                     |        | S4              | 1     |
| 3   | Log out                                                                   | `POST /auth/logout`                    |        | S13             | 1     |
| 4   | Refresh token                                                             | `POST /auth/refresh`                   |        | client          | 1     |
| 5   | Forgot / reset password (D10)                                             | `POST /auth/password/forgot`, `/reset` |        | S4              | 1     |
| 6   | List plans                                                                | `GET /plans`                           |        | S2              | 1     |
| 7   | List membership periods                                                   | `GET /membership-periods`              |        | S2              | 1     |
| 8   | List payment methods (optional)                                           | `GET /payment-methods`                 |        | S2, S8          | 1     |
| 9   | Current member: profile, status, tier, ID, since, valid until, QR payload | `GET /me`                              |        | S3, S5, S6, S13 | 1     |
| 10  | Upload photo (if not part of register)                                    | `POST /me/photo`                       |        | S2              | 1     |
| 11  | Payment history                                                           | `GET /me/payments`                     |        | S7              | 2     |
| 12  | Communications                                                            | `GET /me/notifications`                |        | S12             | 2     |
| 13  | News                                                                      | `GET /news`                            |        | S9              | 3     |
| 14  | Events, including my RSVP state                                           | `GET /events`                          |        | S9              | 3     |
| 15  | RSVP / cancel RSVP                                                        | `POST` / `DELETE /events/{id}/rsvp`    |        | S9              | 3     |
| 16  | FAQs and contact info (optional)                                          | `GET /faqs`, `GET /contact`            |        | S11             | 3     |
| 17  | List / add family members                                                 | `GET` / `POST /me/family`              |        | S10             | 4     |
| 18  | Record donation                                                           | `POST /donations`                      |        | S8              | 4     |

### 4.5 What to ask the backend developer for

With the collection, ask for:

- [ ] Auth scheme: token type, expiry, and whether there's a refresh token
- [ ] Error response format, especially field-level validation errors
- [ ] Example responses for **error** cases, not just success
- [ ] Date format (ISO 8601 UTC preferred) and money format (decimal string or cents)
- [ ] Pagination format for news, events, payments and notifications
- [ ] File upload format for the member photo
- [ ] Membership status values: pending, active, rejected, expired (D2)
- [ ] Staging base URL
- [ ] OpenAPI export, if the framework supports it

### 4.6 When the collection arrives

1. Commit it to `api-contract/`.
2. Fill the **Actual** column in §4.4.
3. Write zod schemas and mappers from the example responses.
4. Send the backend developer a gap list: features with no endpoint, missing fields (D3, D24) and missing error formats.
5. Move features from mock to live one at a time.

---

## 5. Payments seam

- **v1:** all five methods are **manual**. The member pays outside the app, then records the method, amount, account and reference. The payment starts as **Pending** until staff confirm it in the admin panel.
- **Later:** gateway methods (Zaad first, then eDahab) start a payment inside the app, then wait for or poll the confirmation.

```ts
type PaymentMethodId = 'cash' | 'zaad' | 'edahab' | 'dahabshiil' | 'premier_bank';
type PaymentPurpose = 'membership' | 'donation' | 'renewal';

interface PaymentIntent {
  purpose: PaymentPurpose;
  amountUsd: number;
  memberId?: string;
}

type PaymentResult =
  | { status: 'pending'; paymentId?: string } // manual, or gateway awaiting confirmation
  | { status: 'completed'; paymentId: string }
  | { status: 'failed'; reason: string };

interface PaymentMethod {
  id: PaymentMethodId;
  kind: 'manual' | 'gateway';
  Form: React.ComponentType<PaymentFormProps>; // manual: account + reference; gateway: phone to charge
  submit(intent: PaymentIntent, input: unknown): Promise<PaymentResult>;
}
```

- `features/payments/methods/` holds the registry of methods.
- Registration Step 4 and Donate render the selected method's `Form` and call `submit`. They never branch on which method it is.
- **During registration**, manual details are sent with the register request. A gateway payment runs right after the account is created.
- **Switching Zaad to a gateway** means adding `zaad.gateway.ts` and changing its registry entry. No screens change.

---

## 6. Design system

### 6.1 Brand palette

`brand.orange` is the party's official brand colour, confirmed by the user. The rest were sampled from the official logo artwork.

| Token          | Hex           | Source                             | Intended use                                                    |
| -------------- | ------------- | ---------------------------------- | --------------------------------------------------------------- |
| `brand.orange` | **`#FE7B00`** | Official brand colour              | Primary brand surfaces, highlights, card panel, selected states |
| `brand.green`  | `#66783C`     | Logo's outer ring and olive branch | Primary buttons and links (white text)                          |
| `brand.ink`    | `#1A1512`     | Wordmark                           | Text on orange, headings                                        |
| `brand.brown`  | `#996353`     | The falcon                         | Secondary accent (white text is readable on it)                 |
| `brand.cream`  | `#FFEFDB`     | Logo background                    | Warm surfaces                                                   |
| `brand.sand`   | `#E3CFB6`     | Falcon's chest                     | Borders and dividers on warm surfaces                           |

Note: the laurel in the artwork is `#FD8E00`, slightly lighter than the official `#FE7B00`. Use the official value for UI; the logo keeps its own.

**Contrast rules** (WCAG AA needs 4.5:1 for normal text):

| Pairing                   | Ratio  | Rule                                                                        |
| ------------------------- | ------ | --------------------------------------------------------------------------- |
| White on orange `#FE7B00` | ~2.6:1 | **Never use.** Orange is a surface colour, not a text background for white. |
| Ink on orange             | ~8:1   | Use for all text and icons on orange                                        |
| White on green `#66783C`  | ~4.9:1 | Passes. Green is the primary button colour.                                 |
| White on brown `#996353`  | ~4.9:1 | Passes                                                                      |
| Ink on cream              | >12:1  | Default body text on warm surfaces                                          |

### 6.2 Brand assets

Official artwork, all **2677 × 2676 px PNG with transparency**. Each contains the seal (falcon in a laurel ring) above the "XISBIGA WADDANI / SOMALILAND NATIONAL PARTY" wordmark.

| File                                  | Contents                    | Use                                                   |
| ------------------------------------- | --------------------------- | ----------------------------------------------------- |
| `logo_official_without_backgroud.png` | Full colour, transparent    | Light surfaces: Welcome, headers, the membership card |
| `logo_official_with_backgroud.png`    | Full colour on a cream disc | Where the logo sits on a busy or coloured surface     |
| `logo_white.png`                      | Solid white silhouette      | On orange, green or dark surfaces                     |
| `logo_black.png`                      | Solid black silhouette      | Monochrome and print, e.g. a printed card             |

Earlier low-resolution files (`wadani_orignal_logo.jpeg`, `wadani_white_logo.png`) are superseded and should be deleted.

**Asset prep in Phase 0:**

- The artwork sits in the middle with a lot of transparent padding (the visible area is roughly 1100 × 1500 px of the 2677 px canvas). Every export needs cropping and re-padding, not just resizing.
- Two crops are needed:
  - **Seal only** (no wordmark) for the app icon, the Home header and the card. The wordmark is unreadable at small sizes.
  - **Full lockup** (seal plus wordmark) for Welcome and the splash screen.
- Exports: app icon 1024², Android adaptive icon (foreground with safe padding) and splash. For the app icon, the white silhouette on an orange `#FE7B00` background reads best at small sizes.
- Ask the party for the **SVG** if they have it. The PNGs are big enough for every export, so this is a nice-to-have rather than a blocker.

### 6.3 Foundations (Phase 0)

- **Tokens:**
  - colours: brand, neutrals, and semantic (success, warning, danger, info)
  - type scale
  - 4pt spacing
  - radii and elevation
- **Theme:** light theme only in v1, with tokens structured so dark mode can be added later.
- **Core components:**
  - layout: `Screen` (safe area, scroll, keyboard avoiding), `Text`, `Card`
  - actions: `Button` (primary, secondary, ghost, danger; loading and disabled states)
  - inputs: `TextField`, `PasswordField`, `PhoneField` (+252 default), `SelectField` (bottom sheet)
  - navigation and status: `SegmentedTabs`, `StatusPill`, `StepIndicator`, `Avatar` (photo or initials)
  - states and feedback: `EmptyState`, `ErrorState` (with Retry), `Skeleton`, `Toast`

---

## 7. Phases

Every phase ends with:

- typecheck, lint and tests passing
- an internal EAS preview build for Android and iOS
- a demo on mock data, plus the live backend wherever endpoints exist

### Phase 0: Foundations (no backend needed)

- [x] Git repo; Expo app SDK 57 (TS strict, Expo Router); ESLint and Prettier; path aliases; env config; EAS profiles
- [x] Brand assets: seal and lockup crops in colour, white and black; app icon, adaptive icon and splash generated by `npm run brand:assets` (§6.2)
- [x] Tokens, theme hook and the core components from §6.3
- [x] Dev-only component gallery at the `/gallery` route
- [x] Navigation shell: `(auth)` and `(app)` groups, tabs, and the auth gate driven by a demo session
- [x] API client, `ApiError`, per-feature mock switch, mock latency and failure helpers
- [x] TanStack Query with the MMKV persister (card and profile only); SecureStore wrapper
- [x] i18n setup (`en`, plus an `so` skeleton)
- [x] Jest with unit tests for formatting and error mapping
- [ ] Visual direction: review the gallery on a device and settle the look before Phase 1 screens
- [ ] First development build on a device

**Known issue — local iOS build blocked (2026-09-16):** this machine's Xcode (26.1.1 /
Swift 6.2.1) is newer than what `expo-modules-jsi@57.1.0` (a dependency of
`expo-modules-core`, pulled in by every Expo module) was built against. Compiling
it locally hits three separate Swift 6 strict-concurrency errors. Two are fixed
via `patches/expo-modules-jsi+57.1.0.patch` (`patch-package`, runs on `npm install`):
a `weak let` property syntax the newer compiler rejects, and a `SWIFT_SHARED_REFERENCE`
macro ordering issue. The third — raw pointers sent across an actor boundary in
`JavaScriptRuntime.swift`'s host-callback bridge — needs real thread-safety
verification of code we don't own, so it wasn't patched blind. Until Expo ships a
fix (or SDK 58 stabilizes — the top-level `expo` package is preview-only as of this
date, `58.0.0-preview.2`), **use EAS Build for iOS** (its managed macOS image is
version-matched to the SDK, so it doesn't hit this) rather than `expo run:ios`
locally. Android is unaffected — no Swift involved — and builds locally once the
NDK is installed (`sdk.dir` in `android/local.properties`, itself gitignored since
`android/` is a generated folder).

**Exit criteria:**

- The app boots on both platforms — Android locally, iOS via an EAS development build.
- The gallery shows every component in every state.
- Switching between mock and live changes the data source without code changes.

### Phase 1: Onboarding (S1–S4)

Needs D1–D13 answered and endpoints 1–10.

- [x] Welcome
- [x] Registration wizard:
  - the rules in §1.3
  - plan and period loading, error and retry
  - amount prefill (D5), photo (D4), consent (D11), draft (D12)
  - server field errors mapped back to their fields
- [x] Pending screen and routing by status (D2)
- [x] Login, forgot password (D10), logout, session restore on launch
- [ ] Maestro flows for register and login (covered for now by the phase checks and a manual pass)

Decisions taken as proposed: D1 (the password is checked; the mock rejects a wrong one), D2 (pending and rejected members are routed to the review screen and cannot reach the app, on launch as well), D3 (every collected field is sent), D4 (optional photo on step 1), D5 (the amount is prefilled with price × years and stays editable), D6 (only completed steps are tappable), D7 (a server field error jumps the wizard back to that field's step), D8 (email stays required), D9 (birth year optional, must be a real 4-digit year), D10 (no reset endpoint yet, so "Forgot password?" opens WhatsApp to the office), D11 (consent is required), D12 (the draft survives a restart and the password is never written to disk).

**Exit criteria:** register → pending → approved in the admin panel → login → Home, working on both mock and live. _(Verified on mock end to end: registering lands on the review screen and survives a relaunch; the approved fixture member logs in to Home and a wrong password is refused. The live half waits on the API.)_

### Phase 2: Membership core (S5, S6, S7, S12, S13)

Needs D14–D20 and endpoints 9, 11, 12.

- [x] Design system updated to the approved mockups (`design/app-screens/`): Bricolage Grotesque, Figtree and IBM Plex Mono; floating tab bar; restyled components
- [x] Home: header, greeting, mini card, invite share, tiles, bell icon linking to Communications
- [x] Card: QR, photo or initials, valid-until date, social footer, save and share, expired state
- [x] Payment history: status pills, empty state, pull to refresh
- [x] Communications list
- [x] Profile
- [ ] Offline card verified against the live backend (the member record is already persisted; mock mode can't exercise a failed request)

Decisions taken with the proposals: D14 (QR shows `qrPayload` from `GET /me`), D15, D16 (Save to Photos + Share), D17 (bell on Home). Still open: D18 (social handle is a placeholder), D19 (`EXPO_PUBLIC_INVITE_URL` is empty, so invites send text only). D20 changed: all six tiles stay visible, and the ones for later phases open a "Coming soon" screen.

**Exit criteria:**

- The card opens offline after one online load.
- No screen shows hard-coded sample member data. _(Met: every screen reads `GET /me`, `GET /me/payments` or `GET /me/notifications`, currently served by mocks.)_

### Phase 3: Engagement (S9, S11)

Needs D21–D23 and endpoints 13–16.

- [x] News & Events tabs, with RSVP that updates instantly and rolls back on error
- [x] Contact rows that open call, email or maps; WhatsApp deep link; FAQs

D21 taken: the FAQ answers were rewritten in `src/features/support/api.mock.ts` so they describe v1 (no in-app renewal; Zaad payments confirmed by staff, not instantly). **The party still reviews this copy.** D23 taken: contact details come from `GET /contact`, with the prototype's values as the mock — the party confirms the real ones. D22 taken: no feedback form; the screen is "Contact & FAQs".

**Exit criteria:** an RSVP survives an app restart and shows on another device. _(Pending a live backend: the mock keeps RSVPs in memory for the session only.)_

### Phase 4: Family & Donate (S8, S10)

Needs D24–D25 and endpoints 17–18.

- [x] Family list and add form (new members start as Pending)
- [x] Donate: quick amounts, manual methods through the payments registry, thank-you screen

D24 taken: a new family member is added with a name and relation only, comes back **pending** and has no member ID until the office approves them. Ask the backend whether dependents also need a birth year, gender or their own payment. D25 taken: a donation is recorded as **pending** for the office to confirm, and the thank-you screen says what happens next (cash is handed in at the office; other methods are confirmed when the payment arrives). **Open:** non-cash donations may need a reference number for the office to reconcile — the approved design has no field for it.

**Exit criteria:** both flows work on the live backend, and Donate uses the same payment registry as registration. _(Donate already reads `PAYMENT_METHODS`; the live-backend half waits on the API.)_

### Phase 5: Hardening & v1 release

- [ ] Final app icon, adaptive icon and splash exports reviewed on real devices (prepared in Phase 0, §6.2)
- [ ] Sentry
- [ ] Accessibility pass: screen reader labels, font scaling, contrast
- [ ] Review on slow and offline networks
- [ ] Somali copy review (D13), privacy policy, store listings
- [ ] EAS Submit to the Play Store and App Store

**Exit criteria:** v1 is live in both stores with manual payments.

### Phase 6: Payments & renewal

- [ ] Zaad gateway method (then eDahab) behind the payment registry
- [ ] Renewal flow and expiry reminders (D26)
- [ ] Push notifications (approval, payment received), in addition to the backend's WhatsApp and email messages

**Exit criteria:** a gateway payment completes end to end, and card validity updates without staff action.

---

## 7.1 Checking a phase is really done

`npm run verify:phases` runs [src/**tests**/phase-deliverables.test.ts](../src/__tests__/phase-deliverables.test.ts),
which turns the checklists above into assertions: the screens exist and are no
longer placeholders, each feature's mock offers exactly what its live client
does, the behaviour each phase promised holds (offline card persistence,
optimistic RSVP, pending family members, pending donations), and every screen's
wording exists in the i18n bundle. Phases not yet built are listed as `todo`, so
the outstanding work stays visible. It also runs as part of `npm test`.

Keep it honest: when a phase gains a deliverable, add the matching check.

## 8. Immediate next actions

| Who                         | Action                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **You**                     | Confirm or change **D1–D13**, the Phase 1 blockers. Accepting the proposals as written is fine.             |
| **You → backend developer** | Share §4.4 and the §4.5 checklist when asking for the Postman collection.                                   |
| **You → party**             | Ask for the real contact details and social handles, and the FAQ copy. Logos and the brand colour are done. |
| **Claude**                  | Start Phase 0. It doesn't depend on any of the above.                                                       |
