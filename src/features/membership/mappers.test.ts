import { cardFixture, planFixtures } from './api.mock';
import {
  amountInPlanRange,
  badgeForPlanName,
  membershipTotal,
  planRange,
  toMemberCard,
  toPlan,
  toUsd,
} from './mappers';
import { plansResponse } from './schemas';

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

  it('charges the chosen monthly amount for each month typed (2026-10-06)', () => {
    expect(membershipTotal(25, 1)).toBe(25);
    expect(membershipTotal(25, 12)).toBe(300);
    expect(membershipTotal(50, 60)).toBe(3000);
    // Cents stay exact: 3 × $0.10 is $0.30, not 0.30000000000000004.
    expect(membershipTotal(0.1, 3)).toBe(0.3);
  });

  it("holds the monthly amount to the plan's range; a fixed plan to its price", () => {
    const range = toPlan({ id: 'r', name: 'R', price: '10', priceMax: '50', benefits: [] });
    expect(planRange(range)).toEqual({ min: 10, max: 50 });
    expect(amountInPlanRange(range, 10)).toBe(true);
    expect(amountInPlanRange(range, 50)).toBe(true);
    expect(amountInPlanRange(range, 9.99)).toBe(false);
    expect(amountInPlanRange(range, 50.01)).toBe(false);

    const fixed = toPlan(planFixtures[0]); // $25
    expect(planRange(fixed)).toEqual({ min: 25, max: 25 });
    expect(amountInPlanRange(fixed, 25)).toBe(true);
    expect(amountInPlanRange(fixed, 30)).toBe(false);
  });

  it('maps the card, whose code is what the QR carries', () => {
    const card = toMemberCard(cardFixture);
    expect(card.cardCode).toBe('MC-2026-AB12CD');
    expect(card.layout).toBe('vertical');
    expect(card.photoUrl).toBeUndefined();
  });

  it('reads the live plan payload, keeping its badge and price range', () => {
    // Copied from GET /mobile/plans on 2026-09-21. Before the schema knew these
    // fields it silently dropped both.
    const live = {
      plans: [
        {
          id: '836ca018-4d75-44d0-ab3b-3277ae4b6bbe',
          name: 'AQOONSIGA XUBINNIMADA',
          price: '10',
          priceMax: '50',
          iconUrl: 'https://wp-membership-bucket.s3.eu-north-1.amazonaws.com/b183b576.png',
          benefits: ['one', 'two'],
          stars: 1,
        },
      ],
    };
    const [plan] = plansResponse.parse(live).plans.map(toPlan);
    expect(plan.iconUrl).toContain('b183b576.png');
    expect(plan.priceUsd).toBe(10);
    expect(plan.priceMaxUsd).toBe(50);
  });

  it('treats a null priceMax or iconUrl as a fixed price with no badge', () => {
    const [fixed] = plansResponse
      .parse({ plans: [{ id: 'x', name: 'Std', price: '25.00', priceMax: null, iconUrl: null }] })
      .plans.map(toPlan);
    expect(fixed.priceMaxUsd).toBeUndefined();
    expect(fixed.iconUrl).toBeUndefined();
  });

  it('ignores a max that is not above the min', () => {
    const odd = toPlan({ id: 'o', name: 'O', price: '20.00', priceMax: '20.00', benefits: [] });
    expect(odd.priceMaxUsd).toBeUndefined();
  });

  it("finds a card's badge by plan name, and only when that is unambiguous", () => {
    const plans = [
      toPlan({ id: '1', name: 'Gold', price: '5', iconUrl: 'https://x/gold.png', benefits: [] }),
      toPlan({
        id: '2',
        name: 'Silver',
        price: '5',
        iconUrl: 'https://x/silver.png',
        benefits: [],
      }),
      toPlan({ id: '3', name: 'Silver', price: '9', iconUrl: 'https://x/other.png', benefits: [] }),
    ];
    expect(badgeForPlanName(plans, ' gold ')).toBe('https://x/gold.png');
    // Two plans called Silver: showing either could be the wrong badge.
    expect(badgeForPlanName(plans, 'Silver')).toBeUndefined();
    expect(badgeForPlanName(plans, 'Bronze')).toBeUndefined();
    expect(badgeForPlanName(plans, undefined)).toBeUndefined();
    expect(badgeForPlanName([], 'Gold')).toBeUndefined();
  });
});
