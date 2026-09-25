import type { RegistrationForm } from './form';

/**
 * Fills the registration wizard with example data, so manually clicking
 * through a live registration doesn't mean retyping a dozen fields every
 * time. `__DEV__` is false in a release build (Metro replaces it at bundle
 * time), so this can never reach a shipped app.
 *
 * Phone and email are still required to be unique per member, so each call
 * generates a fresh pair rather than reusing one that would 409 on a second
 * attempt. Everything the member should actually decide -- the photo, the
 * wallet number to charge, ticking the consent box, and pressing submit --
 * is deliberately left for a person to do by hand.
 */
export function devPrefill(): RegistrationForm {
  const stamp = Date.now().toString().slice(-6);
  return {
    fullName: 'Cabdi Warsame',
    gender: 'male',
    // A Somali mobile number is 9 digits; keeping the '63' prefix but varying
    // the rest keeps it plausible while guaranteeing it hasn't been used yet.
    phone: `63${stamp}${Math.floor(Math.random() * 10)}`,
    whatsapp: '',
    email: `cabdi.test.${stamp}@example.com`,
    birthYear: '1990',
    education: 'bachelor',
    professionalWork: 'Teacher',
    password: 'CabdiTest2026Pass',
    photoUri: '',
    line1: 'Jigjiga Yar',
    city: 'Hargeisa',
    region: 'Woqooyi Galbeed',
    country: 'Somaliland',
    district: '',
    planId: '',
    periodId: '',
    method: 'WAAFI',
    amount: '',
    payerPhone: '',
    acceptedTerms: false as unknown as true,
  };
}
