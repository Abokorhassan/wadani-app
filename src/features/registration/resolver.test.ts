import '@/i18n';

import { queryClient } from '@/api/query-client';
import { membershipKeys } from '@/features/membership/hooks';
import { toPlan } from '@/features/membership/mappers';

import { emptyRegistration, type RegistrationForm } from './form';
import { registrationResolver } from './resolver';

const PLAN_ID = 'plan-range';
const rangePlan = toPlan({ id: PLAN_ID, name: 'Range', price: '10', priceMax: '50', benefits: [] });

const valid: RegistrationForm = {
  ...emptyRegistration,
  fullName: 'Amina Yusuf',
  gender: 'female',
  phone: '63 234 5678',
  email: '',
  birthYear: '1998',
  education: 'bachelor',
  professionalWork: 'Teacher',
  password: 'secret12345',
  photoUri: 'file:///p.jpg',
  line1: 'Jigjiga Yar',
  city: 'Hargeisa',
  region: 'Woqooyi Galbeed',
  planId: PLAN_ID,
  periodId: 'period-1',
  method: 'WAAFI',
  amount: '20',
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
  beforeEach(() => queryClient.setQueryData(membershipKeys.plans, [rangePlan]));
  afterEach(() => queryClient.clear());

  it('accepts a complete, valid registration', async () => {
    expect(await errorsFor(valid)).toEqual({});
  });

  it("refuses an amount above the plan's top, which the backend would accept", async () => {
    const errors = await errorsFor({ ...valid, amount: '100' });
    expect(errors.amount?.message).toContain('$50.00');
  });

  it("refuses an amount below the plan's price", async () => {
    const errors = await errorsFor({ ...valid, amount: '5' });
    expect(errors.amount?.message).toContain('$10.00');
  });

  it('reports every problem at once, not one per tap', async () => {
    // This is what showed on the emulator: only the terms error appeared, because
    // an object-level zod check is skipped while any field is invalid.
    const errors = await errorsFor({
      ...valid,
      amount: '100',
      payerPhone: '',
      acceptedTerms: false as unknown as true,
    });
    expect(errors.amount).toBeDefined();
    expect(errors.payerPhone).toBeDefined();
    expect(errors.acceptedTerms).toBeDefined();
  });

  it('asks for no wallet when paying by card', async () => {
    const errors = await errorsFor({ ...valid, method: 'CARD', payerPhone: '' });
    expect(errors.payerPhone).toBeUndefined();
  });

  it('cannot check the amount until the plan has loaded, and does not pretend to', async () => {
    queryClient.clear();
    expect((await errorsFor({ ...valid, amount: '100' })).amount).toBeUndefined();
  });
});
