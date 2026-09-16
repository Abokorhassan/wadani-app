import { firstName, formatMonthYear, formatUsd, normalizePhone } from './format';

describe('format', () => {
  it('formats amounts with two decimals', () => {
    expect(formatUsd(25)).toBe('$25.00');
    expect(formatUsd(7.5)).toBe('$7.50');
  });

  it('formats a month and year for card validity', () => {
    expect(formatMonthYear('2027-09-14T00:00:00.000Z')).toBe('Sep 2027');
  });

  it('returns an empty string for an unusable date', () => {
    expect(formatMonthYear('not-a-date')).toBe('');
  });

  it('compares phone numbers without formatting', () => {
    expect(normalizePhone('+252 63 234 5678')).toBe('252632345678');
    expect(normalizePhone('252-63-234-5678')).toBe(normalizePhone('+252 63 234 5678'));
  });

  it('takes the first name for greetings', () => {
    expect(firstName('Mohamed Shibbin')).toBe('Mohamed');
  });
});
