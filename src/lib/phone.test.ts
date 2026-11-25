import { formatPhoneForDisplay, samePhone, toInternationalPhone } from './phone';

describe('toInternationalPhone', () => {
  it.each([
    '63 234 5678',
    '632345678',
    '0632345678',
    '252632345678',
    '+252632345678',
    '+252 63 234 5678',
    '(063) 234-5678',
    '00252632345678',
  ])('reads %s as the same Somali number', (input) => {
    expect(toInternationalPhone(input)).toBe('+252632345678');
  });

  it('keeps a number from another country, for members abroad', () => {
    expect(toInternationalPhone('+44 7911 123456')).toBe('+447911123456');
  });

  it.each([
    '',
    '   ',
    '12345',
    '63 234 567', // eight digits
    '63 234 56789', // ten digits
    'abc',
    '63 234 5678x',
    '+252 63 234 567', // a Somali number one digit short
    '+1',
  ])('refuses %j', (input) => {
    expect(toInternationalPhone(input)).toBeNull();
  });
});

describe('samePhone', () => {
  it('matches different spellings of one number', () => {
    expect(samePhone('63 234 5678', '+252632345678')).toBe(true);
  });

  it('never matches an email or an empty value', () => {
    expect(samePhone('a@b.co', 'c@d.co')).toBe(false);
    expect(samePhone('', '')).toBe(false);
  });
});

describe('formatPhoneForDisplay', () => {
  it('spaces a Somali number however it was saved', () => {
    for (const saved of ['+252634567890', '252634567890', '0634567890', '634567890']) {
      expect(formatPhoneForDisplay(saved)).toBe('+252 63 456 7890');
    }
    // The party's own number, as it sits in the app's settings.
    expect(formatPhoneForDisplay('252653140475')).toBe('+252 65 314 0475');
  });

  it('keeps a number from abroad in its international form', () => {
    expect(formatPhoneForDisplay('+447911123456')).toBe('+447911123456');
  });

  it('shows a number it cannot read as saved, never as another country', () => {
    expect(formatPhoneForDisplay('63000000')).toBe('63000000');
    expect(formatPhoneForDisplay(' 12345 ')).toBe('12345');
  });
});
