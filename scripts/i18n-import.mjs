#!/usr/bin/env node
// Import the team's reviewed CSV back into en.json + so.json, ready to publish.
//
//   npm run i18n:import            # write the changes
//   npm run i18n:import -- --check # validate only, write nothing (for CI)
//
// Reads scripts/i18n-review.csv (columns: key, english, somali) and rewrites
// both locale files, preserving the original key order. It refuses to write if
// a translation drops or alters an interpolation placeholder such as {{name}}.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { flatten, unflatten, parseCsv, placeholders } from './i18n-lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const localesDir = join(here, '..', 'src', 'i18n', 'locales');
const csvFile = join(here, 'i18n-review.csv');
const checkOnly = process.argv.includes('--check');

if (!existsSync(csvFile)) {
  console.error(`Missing ${csvFile}. Run "npm run i18n:export" first.`);
  process.exit(1);
}

const rows = parseCsv(readFileSync(csvFile, 'utf8')).filter((r) => r.some((c) => c !== ''));
const header = rows.shift();
if (!header || header[0] !== 'key' || header[1] !== 'english' || header[2] !== 'somali') {
  console.error('Unexpected CSV header. Expected: key, english, somali');
  process.exit(1);
}

const currentEn = flatten(JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf8')));

const enFlat = {};
const soFlat = {};
const errors = [];
const seen = new Set();

for (const [rowIndex, [key, english, somali]] of rows.entries()) {
  const line = rowIndex + 2; // +1 header, +1 for 1-based
  if (!key) {
    errors.push(`Line ${line}: empty key.`);
    continue;
  }
  if (seen.has(key)) {
    errors.push(`Line ${line}: duplicate key "${key}".`);
    continue;
  }
  seen.add(key);

  if (!(key in currentEn)) {
    errors.push(`Line ${line}: unknown key "${key}" (not used in the app).`);
  }
  if (!english) {
    errors.push(`Line ${line}: English is required for "${key}".`);
  }

  enFlat[key] = english;
  if (somali) {
    const enPh = placeholders(english).join(' ');
    const soPh = placeholders(somali).join(' ');
    if (enPh !== soPh) {
      errors.push(
        `Line ${line}: "${key}" placeholder mismatch — English has [${enPh || 'none'}], Somali has [${soPh || 'none'}].`
      );
    }
    soFlat[key] = somali;
  }
}

// Every English key the app relies on must still be present after review.
for (const key of Object.keys(currentEn)) {
  if (!seen.has(key)) errors.push(`Key "${key}" is missing from the CSV.`);
}

if (errors.length > 0) {
  console.error(`Found ${errors.length} problem(s):`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

if (checkOnly) {
  console.log(`OK — ${Object.keys(enFlat).length} keys valid. No files written (--check).`);
  process.exit(0);
}

const write = (name, flat) =>
  writeFileSync(join(localesDir, name), JSON.stringify(unflatten(flat), null, 2) + '\n', 'utf8');

write('en.json', enFlat);
write('so.json', soFlat);

const missingSomali = Object.keys(enFlat).length - Object.keys(soFlat).length;
console.log(`Published ${Object.keys(enFlat).length} keys to en.json and so.json.`);
if (missingSomali > 0) {
  console.log(
    `  ${missingSomali} key(s) still have no Somali translation (will fall back to English).`
  );
}
