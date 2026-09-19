# Working in this repo

Waddani membership app: Expo (React Native) client for a backend built by a separate developer.

**Read [docs/build-plan.md](docs/build-plan.md) first**, and
[docs/handover.md](docs/handover.md) for the current state, machine setup and the
decisions already taken.
The build plan holds the functional spec, the open decisions (D1–D26), the architecture and the phase plan.
[docs/waddani-membership.html](docs/waddani-membership.html) is a prototype from
the backend developer: it defines the _workflow_ only, never the visual design.

Expo has changed a lot; check the versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before writing native or router code.

## Conventions

- `src/app/` holds routes only. They compose feature components and contain no
  data fetching or business logic.
- A feature (`src/features/<name>/`) exposes a public `index.ts`; other features
  import only from that. The one exception: a feature's _data_ layer (api,
  mappers, hooks) imports another feature's data module directly, so screens'
  components never get pulled into non-UI code.
- Screens use domain types from a feature's `mappers.ts`, never raw backend
  payloads. Responses are validated with zod at the API boundary.
- Every user-facing string goes through i18n (`src/i18n`).
- `src/design-system/` never imports from `src/features/`. Use semantic theme
  roles (`theme.color.action`), not raw palette values.
- Orange never carries white text: it fails contrast. Dark text on orange,
  white text on green. See the palette notes in the build plan §6.

## Checks

```bash
npm run typecheck && npm run lint && npm test
```

`npm test` includes the phase acceptance checks. To see a phase's deliverables
as a checklist, run `npm run verify:phases`; add a check there whenever a phase
gains a deliverable.
