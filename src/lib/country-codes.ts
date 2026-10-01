/**
 * Dialling codes offered by the phone fields. Somaliland comes first because
 * almost every member is there; the rest are where the diaspora lives.
 *
 * Names are proper nouns and stay in English, like the payment brand names.
 * No flag emoji: there is none for Somaliland, and Somalia's would be wrong.
 */
export interface CountryCode {
  /** Unique per row, even where two countries share a dial code (US and Canada). */
  id: string;
  name: string;
  dial: string;
}

export const SOMALI_DIAL = '+252';

export const COUNTRY_CODES: readonly CountryCode[] = [
  { id: 'somaliland', name: 'Somaliland', dial: '+252' },
  { id: 'ET', name: 'Ethiopia', dial: '+251' },
  { id: 'DJ', name: 'Djibouti', dial: '+253' },
  { id: 'KE', name: 'Kenya', dial: '+254' },
  { id: 'UG', name: 'Uganda', dial: '+256' },
  { id: 'TZ', name: 'Tanzania', dial: '+255' },
  { id: 'EG', name: 'Egypt', dial: '+20' },
  { id: 'ZA', name: 'South Africa', dial: '+27' },
  { id: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { id: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { id: 'QA', name: 'Qatar', dial: '+974' },
  { id: 'KW', name: 'Kuwait', dial: '+965' },
  { id: 'OM', name: 'Oman', dial: '+968' },
  { id: 'BH', name: 'Bahrain', dial: '+973' },
  { id: 'YE', name: 'Yemen', dial: '+967' },
  { id: 'TR', name: 'Turkey', dial: '+90' },
  { id: 'GB', name: 'United Kingdom', dial: '+44' },
  { id: 'IE', name: 'Ireland', dial: '+353' },
  { id: 'SE', name: 'Sweden', dial: '+46' },
  { id: 'NO', name: 'Norway', dial: '+47' },
  { id: 'DK', name: 'Denmark', dial: '+45' },
  { id: 'FI', name: 'Finland', dial: '+358' },
  { id: 'NL', name: 'Netherlands', dial: '+31' },
  { id: 'BE', name: 'Belgium', dial: '+32' },
  { id: 'DE', name: 'Germany', dial: '+49' },
  { id: 'FR', name: 'France', dial: '+33' },
  { id: 'CH', name: 'Switzerland', dial: '+41' },
  { id: 'IT', name: 'Italy', dial: '+39' },
  { id: 'US', name: 'United States', dial: '+1' },
  { id: 'CA', name: 'Canada', dial: '+1' },
  { id: 'AU', name: 'Australia', dial: '+61' },
  { id: 'MY', name: 'Malaysia', dial: '+60' },
  { id: 'IN', name: 'India', dial: '+91' },
  { id: 'CN', name: 'China', dial: '+86' },
];

/**
 * Splits "+44 7911 123456" into its dialling code and the rest. The phone
 * field writes values as "<dial> <number>", so the first space is the border.
 * Anything else (an old value typed without a code) is read as a Somali number.
 */
export function splitPhone(value: string): { dial: string; national: string } {
  const match = /^(\+\d{1,4}) (.*)$/.exec(value);
  if (match) return { dial: match[1], national: match[2] };
  return { dial: SOMALI_DIAL, national: value };
}
