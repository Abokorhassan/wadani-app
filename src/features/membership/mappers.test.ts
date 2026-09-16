import { periodFixtures, planFixtures } from './api.mock';
import { priceFor, toMembershipPeriod, toPlan } from './mappers';

describe('membership mappers', () => {
  it('renames the backend benefit flag to the domain one', () => {
    const plan = toPlan(planFixtures[0]);
    expect(plan.name).toBe('Standard');
    expect(plan.benefits[0]).toEqual({
      text: 'Digital membership card & QR check-in',
      included: true,
    });
    expect(plan.benefits[2].included).toBe(false);
  });

  it('prices a plan by the chosen period, not per year (D5)', () => {
    const plan = toPlan(planFixtures[1]); // Silver, $50 / year
    const [oneYear, twoYears] = periodFixtures.map(toMembershipPeriod);

    expect(priceFor(plan, oneYear)).toBe(50);
    expect(priceFor(plan, twoYears)).toBe(100);
  });
});
