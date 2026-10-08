import '@/i18n';

import { toPlan } from '@/features/membership/mappers';

import { quoteFor } from './quote';

const range = toPlan({ id: 'r', name: 'R', price: '10', priceMax: '50', benefits: [] });
const fixed = toPlan({ id: 'f', name: 'F', price: '25', benefits: [] });

describe('quoteFor', () => {
  it('is the chosen monthly amount times the months', () => {
    expect(quoteFor(range, '17', '6')).toEqual({ monthlyUsd: 17, months: 6, totalUsd: 102 });
    expect(quoteFor(range, '37.50', '12')?.totalUsd).toBe(450);
    expect(quoteFor(fixed, '25', '3')?.totalUsd).toBe(75);
  });

  it('is null until there is a plan', () => {
    expect(quoteFor(undefined, '17', '6')).toBeNull();
  });

  it("is null for an amount outside the plan's range, which the backend would charge", () => {
    expect(quoteFor(range, '9.99', '6')).toBeNull();
    expect(quoteFor(range, '50.01', '6')).toBeNull();
    // A fixed plan has exactly one amount.
    expect(quoteFor(fixed, '30', '6')).toBeNull();
  });

  it('is null for months outside 1 to 60, so a button never reads "Pay $0.00"', () => {
    for (const months of ['0', '61', '1.5', '-1', 'abc', '']) {
      expect(quoteFor(range, '17', months)).toBeNull();
    }
    expect(quoteFor(range, '17', '1')?.months).toBe(1);
    expect(quoteFor(range, '17', '60')?.months).toBe(60);
  });

  it('is null for an amount that is not a real one', () => {
    for (const amount of ['', 'abc', '10.999', '1e3']) {
      expect(quoteFor(range, amount, '6')).toBeNull();
    }
  });
});
