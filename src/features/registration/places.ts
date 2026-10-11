import { citiesOf, COUNTRY, REGIONS } from './somaliland-places';
import world from './world-places.json';

/**
 * Where a member can live, largest area first: country, then region, then city.
 *
 * Somaliland is listed first and by hand (its regions and towns are curated); the
 * rest of the world comes from world-places.json, which the member can pick a
 * country and a state / province from. Cities outside Somaliland are typed, as
 * there is no compact worldwide city list. Somalia is left out on purpose.
 */
interface WorldCountry {
  code: string;
  name: string;
  regions: string[];
}

const countries = world as WorldCountry[];

export const COUNTRIES: readonly string[] = [COUNTRY, ...countries.map((country) => country.name)];

/** The pick list for a country's regions; empty when the member has to type theirs. */
export function regionsOf(country: string | undefined): readonly string[] {
  if (country === COUNTRY) return REGIONS;
  return countries.find((candidate) => candidate.name === country)?.regions ?? [];
}

/** The pick list for a region's towns; only Somaliland has one. */
export function citiesFor(
  country: string | undefined,
  region: string | undefined
): readonly string[] {
  return country === COUNTRY ? citiesOf(region) : [];
}

export { COUNTRY };
