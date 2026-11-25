import '@/i18n';

import { queryClient } from '@/api/query-client';
import { membershipKeys } from '@/features/membership/hooks';
import { toPlan } from '@/features/membership/mappers';

import { emptyRegistration, type RegistrationForm } from './form';
import { registrationResolver } from './resolver';

const rangePlan = toPlan({
  id: 'plan-1',
  name: 'Range',
  price: '10',
  priceMax: '50',
  benefits: [],
});

const freePlan = toPlan({ id: 'plan-free', name: 'Free', price: '0.00', benefits: [] });
const yearlyPlan = toPlan({
  id: 'plan-yearly',
  name: 'Yearly',
  price: '50',
  benefits: [],
  durationType: 'FIXED',
  durationMonths: 12,
});

const valid: RegistrationForm = {
  ...emptyRegistration,
  fullName: 'Amina Yusuf',
  gender: 'female',
  phone: '63 234 5678',
  email: 'amina@example.com',
  birthYear: '1998',
  education: 'bachelor',
  professionalWork: 'Teacher',
  password: 'secret12345',
  photoUri: 'file:///p.jpg',
  line1: 'Jigjiga Yar',
  city: 'Hargeisa',
  region: 'Woqooyi Galbeed',
  planId: 'plan-1',
  amount: '25',
  months: '12',
  method: 'WAAFI',
  payerPhone: '63 234 5678',
  acceptedTerms: true,
};

async function errorsFor(values: RegistrationForm) {
  const result = await registrationResolver(values, undefined, {
    fields: {},
    criteriaMode: 'firstError',
    shouldUseNativeValidation: false,
  });
  return 'errors' in result ? result.errors : {};
}

describe('registration resolver', () => {
  beforeEach(() =>
    queryClient.setQueryData(membershipKeys.plans, [rangePlan, freePlan, yearlyPlan])
  );
  afterEach(() => queryClient.clear());

  it('accepts a complete, valid registration', async () => {
    expect(await errorsFor(valid)).toEqual({});
  });

  it("holds the months to the API's own 1 to 60", async () => {
    for (const months of ['1', '12', '60']) {
      expect((await errorsFor({ ...valid, months })).months).toBeUndefined();
    }
    for (const months of ['0', '61', '1.5', '-1', 'abc', '']) {
      expect((await errorsFor({ ...valid, months })).months).toBeDefined();
    }
  });

  it("holds the monthly amount to the chosen plan's range (2026-10-06)", async () => {
    for (const amount of ['10', '25', '37.50', '50']) {
      expect((await errorsFor({ ...valid, amount })).amount).toBeUndefined();
    }
    // The backend would charge these as sent.
    expect((await errorsFor({ ...valid, amount: '9.99' })).amount?.message).toContain('$10.00');
    expect((await errorsFor({ ...valid, amount: '51' })).amount?.message).toContain('$50.00');
    // Not a real amount at all.
    for (const amount of ['', 'abc', '10.999', '1e3']) {
      expect((await errorsFor({ ...valid, amount })).amount).toBeDefined();
    }
  });

  it('cannot check the range until the plans have loaded, and does not pretend to', async () => {
    queryClient.clear();
    expect((await errorsFor({ ...valid, amount: '500' })).amount).toBeUndefined();
  });

  it('reports every problem at once, not one per tap', async () => {
    // This is what showed on the emulator: only the terms error appeared, because
    // an object-level zod check is skipped while any field is invalid.
    const errors = await errorsFor({
      ...valid,
      months: '0',
      payerPhone: '',
      acceptedTerms: false as unknown as true,
    });
    expect(errors.months).toBeDefined();
    expect(errors.payerPhone).toBeDefined();
    expect(errors.acceptedTerms).toBeDefined();
  });

  it('asks for nothing about payment on a free plan, but still for the terms', async () => {
    const free: RegistrationForm = {
      ...valid,
      planId: 'plan-free',
      amount: '',
      months: '',
      payerPhone: '',
    };
    expect(await errorsFor(free)).toEqual({});

    const errors = await errorsFor({ ...free, acceptedTerms: false as unknown as true });
    expect(Object.keys(errors)).toEqual(['acceptedTerms']);
  });

  it('does not check the hidden months on a fixed-length plan, but still the amount', async () => {
    const yearly = { ...valid, planId: 'plan-yearly', amount: '50', months: '' };
    expect(await errorsFor(yearly)).toEqual({});
    expect((await errorsFor({ ...yearly, amount: '49' })).amount).toBeDefined();
  });

  it('asks for no wallet when paying by card', async () => {
    const errors = await errorsFor({ ...valid, method: 'CARD', payerPhone: '' });
    expect(errors.payerPhone).toBeUndefined();
  });

  it('accepts a phone from abroad, but only a Somali wallet', async () => {
    // Members abroad register with their own number (2026-09-29)...
    expect((await errorsFor({ ...valid, phone: '+44 7911 123456' })).phone).toBeUndefined();
    expect((await errorsFor({ ...valid, whatsapp: '+46 070 123 4567' })).whatsapp).toBeUndefined();
    // ...but a local wallet can only charge a Somali number.
    expect((await errorsFor({ ...valid, payerPhone: '+44 7911 123456' })).payerPhone).toBeDefined();
  });
});
