/** Formatting helpers shared across screens. Locale-aware where it matters. */

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatDate(iso: string, locale = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "Sep 2027", used for card validity and "member since". */
export function formatMonthYear(iso: string, locale = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

/** "Sep 13", for recent items in a list. */
export function formatDayMonth(iso: string, locale = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function formatTime(iso: string, locale = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

/** Phone numbers are compared without formatting, as the prototype did. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
