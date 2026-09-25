import { cardFixture, planFixtures } from './api.mock';
import {
  amountProblem,
  amountWithinPlan,
  badgeForPlanName,
  defaultAmount,
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

  it("offers the plan's price whatever the period, as the prototype does (D5)", () => {
    // The API gives a period no price ({id, label, months}) and the prototype
    // prefills the plan's price regardless of period. Scaling by years, as an
    // earlier version did, would have prefilled $75 for a $25 plan over 3 years.
    const plan = toPlan(planFixtures[1]); // Silver, $50
    expect(defaultAmount(plan)).toBe(50);
    expect(defaultAmount(toPlan(planFixtures[0]))).toBe(25);
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

  it("checks a range-priced plan's amount, since the backend will not", () => {
    const range = toPlan({ id: 'r', name: 'Gold', price: '5.00', priceMax: '50.00', benefits: [] });

    expect(amountWithinPlan(range, 5)).toBe(true);
    expect(amountWithinPlan(range, 50)).toBe(true);
    expect(amountWithinPlan(range, 4.99)).toBe(false);
    expect(amountWithinPlan(range, 50.01)).toBe(false);

    // The default is the lowest amount the range accepts, so it is always valid.
    expect(defaultAmount(range)).toBe(5);
    expect(amountWithinPlan(range, defaultAmount(range))).toBe(true);
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

  it('holds a fixed-price plan to its price, and says which way an amount is wrong', () => {
    // The backend checks neither, so paying $1 for a $25 plan would go through.
    const fixed = toPlan(planFixtures[0]); // $25
    expect(amountProblem(fixed, 1)).toBe('tooLow');
    expect(amountProblem(fixed, 24.99)).toBe('tooLow');
    expect(amountProblem(fixed, 25)).toBeNull();
    // A fixed plan has no top, so paying more (a donation on top) is allowed.
    expect(amountProblem(fixed, 100)).toBeNull();

    const range = toPlan({ id: 'r', name: 'R', price: '10', priceMax: '50', benefits: [] });
    expect(amountProblem(range, 9.99)).toBe('tooLow');
    expect(amountProblem(range, 50.01)).toBe('tooHigh');
    expect(amountProblem(range, 30)).toBeNull();
  });
});
