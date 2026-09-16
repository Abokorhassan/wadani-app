# Waddani Membership

Mobile membership app for Xisbiga Waddani (Somaliland National Party), built with
Expo and React Native.

Members register, pay their membership fee, and get a digital membership card
with a QR code for check-in. The app also carries party news and events, family
members, donations and support contacts.

- **Plan and spec:** [docs/build-plan.md](docs/build-plan.md)
- **Workflow reference:** [docs/waddani-membership.html](docs/waddani-membership.html) (functionality only, not design)

## Getting started

```bash
npm install
cp .env.example .env
npm start
```

The app uses native modules (MMKV, SecureStore, SVG), so it needs a
[development build](https://docs.expo.dev/develop/development-builds/introduction/)
rather than Expo Go:

```bash
npx expo run:ios       # or: npx expo run:android
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the dev server |
| `npm run ios` / `npm run android` | Start on a simulator or device |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint (`-- --fix` to autofix) |
| `npm run format` | Prettier |
| `npm test` | Jest |
| `npm run brand:assets` | Regenerate icons from the official logo artwork (needs Pillow) |

## Environment

`EXPO_PUBLIC_*` variables are bundled into the app, so they hold no secrets.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Backend base URL |
| `EXPO_PUBLIC_API_MOCK` | `all`, `none`, or a comma-separated list of features to mock |
| `EXPO_PUBLIC_MOCK_LATENCY_MS` | Delay on mock responses, so loading states stay visible |

Features can run on mocks or the live backend independently, so screens can be
built before the backend endpoints exist. See `src/api/mode.ts`.

## Structure

```
src/
  app/            routes (Expo Router)
  api/            HTTP client, error model, mock switch, query client
  features/       auth, membership, payments, donations, news-events,
                  family, support, notifications
  design-system/  tokens, theme, shared components
  lib/            storage, secure storage, env, formatting
  i18n/           English and Somali strings
assets/brand/     official logo artwork and generated icons
scripts/          asset generation
docs/             build plan and workflow reference
```

A dev-only component gallery lives at the `/gallery` route.
