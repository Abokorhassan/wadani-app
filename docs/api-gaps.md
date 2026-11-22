# Mobile app ↔ API: what matches, what's missing

**API:** Waddani Mobile Auth API, https://api.wp-membership-system.com
(spec saved at [api-contract/waddani-mobile-api.openapi.json](../api-contract/waddani-mobile-api.openapi.json), read 2026-09-19)
**App:** phases 0–4 built against the workflow in `docs/waddani-membership.html`

Most of the app lines up. The data layer was rewritten onto this contract on
2026-09-19; what is left is listed below, and the questions at the end are for
the backend developer.

## 1. Endpoints the app already expects, and has

| App screen             | Endpoint                                       | Notes                                                                                            |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Registration plan step | `GET /mobile/plans`                            | `price` is a string, plus `stars`; `benefits` is a list of plain strings, not `{text, included}` |
| Registration plan step | `GET /mobile/membership-periods`               | 1, 2 and 3 years live                                                                            |
| Login                  | `POST /mobile/auth/login`                      | `{identifier, password}` → `{accessToken, memberId}`                                             |
| Logout                 | `POST /mobile/auth/logout`                     |                                                                                                  |
| Forgot password        | `POST /mobile/auth/password/forgot` + `/reset` | **Better than planned:** the app currently sends people to WhatsApp (D10)                        |
| My Card                | `GET /mobile/members/me/card`                  |                                                                                                  |
| Payment history        | `GET /mobile/members/me/payments`              |                                                                                                  |
| Donate                 | `POST /mobile/members/me/donations`            | Plus `GET` for donation history, which the app doesn't show yet                                  |
| News                   | `GET /mobile/news` (+ `/{id}`)                 | Paginated: `{news, total, page, pageSize}`; articles have `imageUrl`                             |
| Events                 | `GET /mobile/events` (+ `/{id}`)               |                                                                                                  |

## 2. Things the app has, with no endpoint behind them

| App feature                                                 | Status                                                                                                                                                                      |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Family members** (list + add, Phase 4)                    | No endpoints at all. Shown as "Coming soon" (2026-09-19); the feature module is kept for when they land.                                                                    |
| **Event RSVP**                                              | No RSVP endpoint. Removed from the app (2026-09-19).                                                                                                                        |
| **Communications** (notification history)                   | No endpoint. The backend sends WhatsApp/email, but the app can't list what was sent.                                                                                        |
| **Profile details** (phone, email, education, member since) | `GET /mobile/auth/me` returns only `{id, organizationId}`. The app keeps what registration returned; a member signing in on another device sees only what the card carries. |
| **Contact details and FAQs**                                | No endpoints. Fine to keep in the app as static content, unless the party wants to edit them.                                                                               |

## 3. Where the app and the API disagreed — and what the app now does

Resolved on 2026-09-19: the app was rewritten onto the API's model. What
follows describes both sides, so the differences stay visible.

**Payments are charged online, not recorded by hand.** The app was built for the
prototype's flow: the member pays outside the app, types in the amount,
the account they paid from and a reference, and the office confirms it.
The API instead charges the member through Sifalo Pay during registration:
`method` is `WAAFI`, `EDAHAB`, `PREMIER_WALLET` or `CARD`, and the charge
happens immediately. **Zaad, cash, Dahabshiil and Premier Bank are not options
for self-registration.** **Done:** the registration payment step and the donate
screen now offer the four Sifalo methods, take a `payerPhone` to charge, and no
longer ask for an amount paid, an account or a reference.

**Card payments need a checkout round-trip.** `POST /auth/register` (and
donate, and renew) answer `202` with `{checkoutId, checkoutUrl}` for
`method: CARD`. **Done (2026-09-22):** the app sends
`returnUrl: https://wp-membership-system.com/pay/return` and opens the Sifalo page
in an **in-app browser** (react-native-webview), not an external one, since an
external browser would leave the member stranded on that web page. The in-app
browser stops the moment it heads for the return URL, reads `sid` and
`checkout_id`, and the app calls `POST /mobile/payments/card/confirm` itself, so
the return page never loads. If the member closes the page instead, the app asks
`GET /mobile/payments/card/checkouts/{id}`, because they may have paid before
closing. After a card registration the app signs the member in with the phone
and password just used, and keeps the member and card from the confirm response.
Tested on Android against a mock checkout page; the real Sifalo page is untested.

**There is no "waiting for approval" step.** Registration returns `201` with the
member, the payment _and_ the issued membership card. Member status is
`REGISTERED | PAYMENT_PENDING | PAID | CARD_ISSUED` — there is no pending-review
or rejected state. The app's review screen and its status routing (D2) assume an
office approval that does not exist; payment, not staff, is the gate. **Done:**
the review screen is now a "confirming your payment" screen, shown only for
`REGISTERED` / `PAYMENT_PENDING`, and the rejected state is gone.

**Registration fields differed. The app now follows the spec exactly:**

| App                            | API                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `email` required (D8)          | optional; **`phone` is the required identity**                                                                           |
| `birthYear` optional (D9)      | **required**                                                                                                             |
| —                              | **`professionalWork` required** — now asked on the personal step                                                         |
| —                              | **`photoUrl` required**, and it's a URL: there is **no upload endpoint**, so the app cannot turn a picked photo into one |
| address: country, city, street | **`line1`, `city`, `region`, `country` required**; region and district now asked                                         |
| `education` lowercase          | `educationalLevel`: `PRIMARY … DOCTORATE \| OTHER` — **no "none"**                                                       |
| gender lowercase               | `MALE \| FEMALE`                                                                                                         |

**Errors carry no field information.** Every failure is
`{error: {message, details?, traceId?}}`, so the app cannot point at the field
that was wrong (D7) — it can only show one message. `409` on register means the
phone or email is taken, which we can map to a field ourselves.

**Renewal already exists** (`POST /mobile/members/me/renew`), though the app
planned it for Phase 6. It answers `409` when the member isn't eligible yet.
The client call is written (`paymentsApi.renew`); no screen uses it yet.

**Small shape notes:** ids are UUIDs (the app assumed `WD-######`); money is a
string; the card carries `cardCode`, `membershipTypeStars` and a
`cardLayout: HORIZONTAL | VERTICAL` the design could follow; there is no refresh
token, just a JWT `accessToken`.

## 3.1 App review against the contract (2026-09-20)

A sweep of every screen for things the API cannot actually do.

**Fixed in this pass:**

- **`family`, `notifications` and `support` still called invented paths**
  (`/me/family`, `/me/notifications`, `/contact`, `/faqs`). Harmless under
  mock mode, but going live means `EXPO_PUBLIC_API_MOCK=none`, which would
  have 404'd the Contact screen, Communications, **and Login's "Forgot
  password?"** — `support` backs that fallback. These three now stay on their
  stand-in data whatever the setting says (`FEATURES_WITHOUT_BACKEND` in
  `src/api/mode.ts`). Remove one from that list when its endpoints land.
  Notifications came off it in November 2026, when the backend added
  `/mobile/notifications`.
- **Three FAQ answers described the old manual flow** — telling members to send
  a Zaad reference for the office to check, and to add family members from the
  home screen. Both impossible now. Rewritten.
- **The Home news tile still advertised "Updates & RSVP"** after RSVP was
  dropped.
- **Login's response schema was lossy.** `z.object()` strips unknown keys, so
  anything the backend returns beyond `accessToken`/`memberId` was being
  discarded silently. It is now `z.looseObject`, and both the extra fields and
  the token's own claims are logged once in development.

**Still open, needing a decision:**

- **Password reset is built but not wired.** The API has
  `POST /mobile/auth/password/forgot` and `/reset`; the client method and
  `usePasswordReset` exist, but Login still opens WhatsApp (D10, decided when
  no endpoint existed). One screen of work to finish.
- **Donations go nowhere the member can see.** `/mobile/members/me/donations`
  is separate from `/payments`, so a donation will not appear in payment
  history — but `useCreateDonation` invalidates that history as though it
  would. `getDonations` has no consumer and no screen.
- **`GET /mobile/auth/me` is never called** (`getMyId` is unused), so a revoked
  or expired token is only discovered on the first real request.
- **Communications** shows notification types `review` and `approved`,
  describing an approval workflow that no longer exists, on a feature with no
  endpoint. Either drop it from v1 or rewrite it around payments and events.
- **Renewal** has an endpoint and a client method, but no UI (Phase 6).

## 3.2 Spec changes picked up on 2026-09-21

The backend developer changed the API after the first read. The saved spec in
`api-contract/` is refreshed; what moved, and what the app does about it:

- **Plans gained `iconUrl` and `priceMax`.** `iconUrl` is the plan's badge, shown
  on the plan card and on the member's card. `priceMax` makes a plan
  range-priced (the live plan is $10 to $50): the member chooses an amount in
  that range, and **the backend does not enforce it**, so the app does. Before,
  the schema silently dropped both fields.
- **Password reset is now a 6-digit OTP** emailed via SES (`identifier` + `otp` +
  `newPassword`), replacing the token. Not built yet; Login still opens WhatsApp.
- **Guest donations exist** (`POST /mobile/donations`: `fullName`, `phone`,
  amount, method), so someone with no membership can donate. Not built; the
  donate screen is members-only.

## 4. Questions for the backend developer

Answered by the party on 2026-09-19:

1. ~~**Family members**~~ — shown as "Coming soon" until endpoints exist.
2. ~~**RSVP**~~ — not supported for now; removed from the app.
3. ~~**Photo**~~ — answered: the app uploads to the party's S3 bucket
   (`wp-membership-bucket`, eu-north-1) itself and sends the public URL as
   `photoUrl`. No backend endpoint is needed, and registration is no longer
   blocked.

   **What this costs, so it is on the record.** Signing the upload in the app
   means the AWS access key and secret are compiled into the shipped app, where
   anyone who unzips it can read them. The party accepted this on 2026-09-19
   after it was raised three times. Two things keep the blast radius small, and
   both are worth doing:

   - Restrict that IAM user to `s3:PutObject` on `wp-membership-bucket/members/*`
     and nothing else. As it stands the key can also **delete** objects — a
     `DELETE` was accepted when the upload path was tested.
   - Rotate the key, since it has been shared in chat.

   The safer design remains a server endpoint that returns a presigned `PUT`
   URL, or an AWS Cognito Identity Pool. Either can replace `src/lib/s3.ts`
   later without touching the registration screens.

Still open:

4. **Member profile** — can `GET /mobile/auth/me` (or another endpoint) return the full member, so the profile screen can show phone, email, education and join date? Failing that, **what claims does the access token carry?** If it already holds these fields the app can read them straight from the JWT — though a token is frozen at login, so an updated detail would stay stale until the next sign-in. That `GET /mobile/auth/me` exists at all, and returns only `{id, organizationId}`, suggests the token holds no more than that.
5. **Notifications** — can the app list the WhatsApp/email messages that were sent?
6. ~~**Payment methods**~~ — answered: every payment goes through Sifalo. The app offers WAAFI (which covers Zaad), EDAHAB, PREMIER_WALLET and CARD only; the other methods are treated as staff-recorded history. Still worth confirming: does Sifalo's WAAFI channel accept Telesom Zaad numbers, or only Hormuud?
7. **Field errors** — could validation failures return which field failed (e.g. `details: {email: "..."}`), so the form can mark it?
8. **Test account** — the Swagger docs login we were given is not a member login; `POST /auth/login` rejects them. Can we have a real test member, and is there a staging server separate from production?
9. **`isEligibleForPayment` / `isNewMember`** — what drives these, and should the app act on them?
10. **Badge on the card** — `GET /mobile/members/me/card` returns the plan's name
    but not its icon, so the app matches the two by name and shows a badge only
    when exactly one plan has that name. Could the card include the plan's
    `iconUrl` (or the plan id)? A renamed or duplicated plan would otherwise lose
    its badge.
11. **Badge size** — the live badge is a 3000×3000 PNG (3 MB) shown at about 56 px.
    Members on mobile data download all of it. Could staff upload around
    256×256 (a few KB), or could the API resize on upload?
12. **Does the membership period change the price?** The evidence says no: a period
    is only `{id, label, months}` with no price anywhere in the spec, and the
    prototype prefills the plan's price whatever period is chosen. So the app
    treats the period as duration only (2026-09-21), and for a range-priced plan the
    member picks any amount in the range. **Unconfirmed, and the party has said it does not know yet** (2026-09-21), so this
    is open. It decides what people are charged. If longer periods should cost more, the API
    needs a rule for it, ideally a price per period, because the backend does not
    check the amount it is sent.
13. **What phone format does the backend expect, and does it normalise?** The app
    used to send a phone exactly as typed ("63 234 5678", no country code), because
    the "+252" in the field is only a label. It now always sends the international
    form ("+252632345678"), matching the spec's example, for the member's phone, their
    WhatsApp, the wallet being charged, and the login identifier. If the backend
    stores or matches phones another way, duplicate detection (`409`) and login would
    disagree with the app.
14. **Sifalo: "No payment route was found for the specified customer account"**
    (`TRANSACTION_FAILED`, HTTP 422) on every live registration, 2026-09-23/24. It
    failed 5 times across two wallet numbers (`+252634253226`, `+252634228267`),
    all `WAAFI`, and the identical request from plain `curl` fails the same way, so
    it is not the app. Is the WAAFI channel (Zaad/Telesom numbers) enabled on the
    Sifalo merchant account? Trace IDs: `dc23c5c981ce731c5edc3c06810f22bc`,
    `462a4e1c4e3708e3a880ab418afbf8d8`, `c6386369db9af668bac6a14e0ed308df`.
15. ~~**Delete account**~~ (App Store Guideline 5.1.1(v)). The backend added
    `DELETE /mobile/members/me` on 2026-11-22: it answers `401 Missing bearer
token` without a session, where it answered `404` the day before. The app
    calls it with `{ "password": "..." }` and signs out on success. Still to
    confirm with the backend developer, since the docs were not readable:
    - Is the password checked? (If not, the app's field is only a speed bump.)
    - What does a wrong password return? The app copes with a `400`
      (`WRONG_PASSWORD`) or a `401` whose message is not about the token.
    - Are the member's other sessions signed out, and what is kept?
