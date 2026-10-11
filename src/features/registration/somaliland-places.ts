/**
 * Where a member can live: Somaliland only (2026-10-11), so there is no country
 * to choose and no Somalia regions. The list follows the standard hierarchy
 * (country > region > city > district > street) and fills the API's own address
 * fields: `country`, `region`, `city`, `district`, `line1`.
 *
 * The six regions and their main towns, spelt the Somali way, as the platform's
 * members map spells them (apps/web/src/lib/geo/places.ts). A town missing here
 * can still be typed in with "Other", so nobody is blocked. The party should
 * confirm the list before launch; this file is the only place to change it.
 */
export const COUNTRY = 'Somaliland';

export const SOMALILAND_PLACES: readonly { region: string; cities: readonly string[] }[] = [
  { region: 'Awdal', cities: ['Boorama', 'Baki', 'Dila', 'Lughaya', 'Saylac'] },
  {
    region: 'Maroodi Jeex',
    cities: ['Hargeysa', 'Arabsiyo', 'Baligubadle', 'Gabiley', 'Salaxley', 'Wajaale'],
  },
  { region: 'Saaxil', cities: ['Berbera', 'Sheekh'] },
  { region: 'Togdheer', cities: ['Burco', 'Buuhoodle', 'Oodweyne'] },
  { region: 'Sool', cities: ['Laascaanood', 'Caynabo', 'Taleex', 'Xudun'] },
  { region: 'Sanaag', cities: ['Ceerigaabo', 'Badhan', 'Ceel Afweyn', 'Laasqoray'] },
];

export const REGIONS: readonly string[] = SOMALILAND_PLACES.map((place) => place.region);

/** The towns listed for a region; none for a region not in the list. */
export function citiesOf(region: string | undefined): readonly string[] {
  return SOMALILAND_PLACES.find((place) => place.region === region)?.cities ?? [];
}
