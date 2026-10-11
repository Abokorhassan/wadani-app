#!/usr/bin/env node
/**
 * Writes src/features/registration/world-places.json: every country with its
 * states / provinces, for the address step's pick lists.
 *
 * The data comes from the `country-state-city` package, which is 17 MB because
 * of its cities, so it is not an app dependency. Install it for one run:
 *
 *   npm install --no-save country-state-city && node scripts/build-world-places.js
 *
 * Somalia is left out on purpose: members there are Somaliland's, which the app
 * lists first by hand (src/features/registration/somaliland-places.ts).
 */
const fs = require('node:fs');
const path = require('node:path');
const { Country, State } = require('country-state-city');

const countries = Country.getAllCountries()
  .filter((country) => country.isoCode !== 'SO')
  .map((country) => ({
    code: country.isoCode,
    name: country.name,
    regions: State.getStatesOfCountry(country.isoCode)
      .map((state) => state.name)
      .sort((a, b) => a.localeCompare(b)),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const target = path.join(__dirname, '..', 'src', 'features', 'registration', 'world-places.json');
fs.writeFileSync(target, JSON.stringify(countries));
console.log(`${countries.length} countries, ${countries.reduce((n, c) => n + c.regions.length, 0)} regions -> ${target}`);
