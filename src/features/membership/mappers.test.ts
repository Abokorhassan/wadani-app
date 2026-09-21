import { cardFixture, periodFixtures, planFixtures } from './api.mock';
import { priceFor, toMemberCard, toMembershipPeriod, toPlan, toUsd } from './mappers';

describe('membership mappers', () => {
  it('reads the backend plan shape: decimal price, plain benefit lines', () => {
    const plan = toPlan(planFixtures[0]);
    expect(plan.name).toBe('Standard');
    expect(plan.priceUsd).toBe(25);
    expect(plan.benefits[0]).toBe('Digital membership card & QR check-in');
    expect(plan.stars).toBe(1);
  });

  it('turns the money strings the API sends into numbers', () => {
    expect(toUsd('24.00')).toBe(24);
    expect(toUsd('0.50')).toBe(0.5);
  });

  it('prices a plan by the chosen period, not per year (D5)', () => {
    const plan = toPlan(planFixtures[1]); // Silver, $50 / year
    const [oneYear, twoYears] = periodFixtures.map(toMembershipPeriod);

    expect(priceFor(plan, oneYear)).toBe(50);
    expect(priceFor(plan, twoYears)).toBe(100);
  });

  it('maps the card, whose code is what the QR carries', () => {
    const card = toMemberCard(cardFixture);
    expect(card.cardCode).toBe('MC-2026-AB12CD');
    expect(card.layout).toBe('vertical');
    expect(card.photoUrl).toBeUndefined();
  });
});
