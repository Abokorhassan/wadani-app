import { samePhone, toInternationalPhone } from './phone';

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
