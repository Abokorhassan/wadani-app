/**
 * Turns a phone number as typed into the international form the API expects,
 * e.g. "+252632345678", or null when it cannot be a real number.
 *
 * The phone field shows a "+252" label, but that is decoration: the value is
 * only what the member typed. Without this, "63 234 5678" would be sent as is,
 * both as the member's identity and as the wallet that gets charged.
 *
 * Somali numbers have nine digits after the country code, so "63 234 5678",
 * "0632345678", "252632345678" and "+252 63 234 5678" all become the same
 * number. A number that starts with "+" and another country code is kept as
 * long as it is a plausible length, because members live abroad.
 */
export function toInternationalPhone(input: string): string | null {
  const trimmed = input.trim();
  const compact = trimmed.replace(/[\s().-]/g, '');
  if (!compact) return null;

  if (compact.startsWith('+') || compact.startsWith('00')) {
    // The phone field writes "<dial> <number>", e.g. "+44 07911 123456". The
    // space marks where the code ends, so a trunk 0 typed after it can go.
    const split = /^\+(\d{1,4})\s+(.+)$/.exec(trimmed);
    const digits = split
      ? split[1] + split[2].replace(/[\s().-]/g, '').replace(/^0/, '')
      : compact.replace(/^(\+|00)/, '');
    if (!/^\d{8,15}$/.test(digits)) return null;
    // A Somali number is exactly nine digits after 252; anything else is a typo.
    if (digits.startsWith('252') && digits.length !== 12) return null;
    return `+${digits}`;
  }

  if (!/^\d+$/.test(compact)) return null;

  if (compact.startsWith('252')) return compact.length === 12 ? `+${compact}` : null;

  const national = compact.replace(/^0/, '');
  return /^\d{9}$/.test(national) ? `+252${national}` : null;
}

/**
 * Two ways of writing the same number compare equal; anything that is not a
 * valid number falls back to its digits, so email identifiers never match.
 */
export function samePhone(a: string, b: string): boolean {
  const left = toInternationalPhone(a) ?? a.replace(/\D/g, '');
  const right = toInternationalPhone(b) ?? b.replace(/\D/g, '');
  return left !== '' && left === right;
}

/**
 * A phone number for people to read: "+252 63 234 5678" for a Somali number,
 * "+44 7911123456" for one abroad. A number that cannot be made sense of is
 * shown as it was saved, rather than with a "+" that would make it another
 * country's ("63000000" is not +63, the Philippines).
 */
export function formatPhoneForDisplay(raw: string): string {
  const international = toInternationalPhone(raw);
  if (!international) return raw.trim();
  const digits = international.slice(1);
  if (digits.startsWith('252')) {
    return `+252 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return international;
}
