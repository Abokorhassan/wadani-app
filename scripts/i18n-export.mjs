#!/usr/bin/env node
// Export en.json + so.json into one reviewable CSV template for the team.
//
//   npm run i18n:export
//
// Produces scripts/i18n-review.csv with columns: key, english, somali.
// Share that file with the team (Excel / Google Sheets), let them edit the
// `english` and `somali` columns, then run `npm run i18n:import` to publish.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { flatten, toCsvRow } from './i18n-lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const localesDir = join(here, '..', 'src', 'i18n', 'locales');
const outFile = join(here, 'i18n-review.csv');

const en = flatten(JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf8')));
const so = flatten(JSON.parse(readFileSync(join(localesDir, 'so.json'), 'utf8')));

// English is the source of truth for which keys exist and their order.
const lines = [toCsvRow(['key', 'english', 'somali'])];
let missingSomali = 0;

for (const [key, english] of Object.entries(en)) {
  const somali = so[key];
  if (somali === undefined) missingSomali++;
  lines.push(toCsvRow([key, String(english ?? ''), somali === undefined ? '' : String(somali)]));
}

writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');

const total = Object.keys(en).length;
console.log(`Exported ${total} keys to ${outFile}`);
if (missingSomali > 0) {
  console.log(`  ${missingSomali} key(s) have no Somali translation yet (blank in the sheet).`);
}
