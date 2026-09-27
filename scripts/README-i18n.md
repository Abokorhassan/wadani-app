# Translations review workflow (English + Somali)

The app's text lives in two files: `src/i18n/locales/en.json` (English) and
`src/i18n/locales/so.json` (Somali). Non-technical teams don't edit those
directly — they review a spreadsheet, and a developer publishes the result.

## For the developer

1. Export the current text into one sheet:

   ```bash
   npm run i18n:export
   ```

   This writes `scripts/i18n-review.csv` with columns `key`, `english`,
   `somali`. Send that file to the team (open it in Excel or Google Sheets).

2. When the team returns the edited sheet, save it back over
   `scripts/i18n-review.csv`, then validate and publish:

   ```bash
   npm run i18n:check    # validates only, writes nothing
   npm run i18n:import    # rewrites en.json + so.json
   ```

3. Commit the updated `en.json` / `so.json` and ship as usual.

## For the reviewing team

- Only edit the **english** and **somali** columns. Never change the **key**
  column or add/remove rows.
- Leave the `somali` cell blank if there's no translation yet — the app shows
  the English text as a fallback.
- Keep placeholders like `{{name}}` or `{{amount}}` exactly as written; the app
  fills those in at runtime. The import will refuse to publish if a placeholder
  is dropped or changed.
- Text like `<terms>…</terms>` marks a tappable link — keep the tags intact.

## Safeguards

`npm run i18n:check` (also safe to run in CI) fails if:

- a key is missing, duplicated, or unknown to the app,
- an English cell is empty, or
- a Somali translation changes the placeholders used in the English source.
