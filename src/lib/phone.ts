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
  const compact = input.trim().replace(/[\s().-]/g, '');
  if (!compact) return null;

  if (compact.startsWith('+') || compact.startsWith('00')) {
    const digits = compact.replace(/^(\+|00)/, '');
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
