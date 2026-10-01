import { cardFixture, planFixtures } from './api.mock';
import { badgeForPlanName, membershipTotal, toMemberCard, toPlan, toUsd } from './mappers';
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

  it("charges the plan's price for each month the member types (2026-09-29)", () => {
    const plan = toPlan(planFixtures[0]); // Standard, $25
    expect(membershipTotal(plan, 1)).toBe(25);
    expect(membershipTotal(plan, 12)).toBe(300);
    expect(membershipTotal(plan, 60)).toBe(1500);
    // Cents stay exact: 3 × $0.10 is $0.30, not 0.30000000000000004.
    const cheap = toPlan({ id: 'c', name: 'C', price: '0.10', benefits: [] });
    expect(membershipTotal(cheap, 3)).toBe(0.3);
    // A range-priced plan is charged from its price; there is no amount to choose.
    const range = toPlan({ id: 'r', name: 'R', price: '10', priceMax: '50', benefits: [] });
    expect(membershipTotal(range, 2)).toBe(20);
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
