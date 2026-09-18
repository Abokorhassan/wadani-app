import { paymentFixtures } from './api.mock';
import { groupByYear, toPayment } from './mappers';

describe('payment mappers', () => {
  it('keeps known statuses and marks anything else unknown', () => {
    expect(toPayment({ ...paymentFixtures[0], status: 'COMPLETED' }).status).toBe('completed');
    expect(toPayment({ ...paymentFixtures[0], status: 'refunded' }).status).toBe('unknown');
  });

  it('groups payments by year, newest first', () => {
    const groups = groupByYear(paymentFixtures.map(toPayment).reverse());
    expect(groups.map((group) => group.year)).toEqual([2026, 2025]);
    expect(groups[0].payments[0].reference).toBe('TX-102938');
  });
});
