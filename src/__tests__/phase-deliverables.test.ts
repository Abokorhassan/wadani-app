/**
 * Phase acceptance checks.
 *
 * One test per deliverable in docs/build-plan.md §7, so a finished phase is
 * proven rather than just ticked off. Phases that have not been built yet are
 * listed as `todo`, which keeps the outstanding work visible in the report.
 *
 * Run on its own with: npm run verify:phases
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import en from '../i18n/locales/en.json';

const ROOT = join(__dirname, '..', '..');
const src = (path: string) => join(ROOT, 'src', path);

const exists = (path: string) => existsSync(src(path));
const source = (path: string) => readFileSync(src(path), 'utf8');
const exports_ = (path: string, name: string) =>
  new RegExp(`export (async )?(function|const|class) ${name}\\b`).test(source(path));

/** Looks up "a.b.c" in the English bundle. */
const hasText = (key: string) =>
  typeof key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], en) === 'string';

/** The mock must offer exactly what the live client offers, or mock mode lies. */
function apiSurfacesMatch(feature: string, liveExport: string, mockExport: string) {
  const live = require(`../features/${feature}/api`)[liveExport];
  const mock = require(`../features/${feature}/api.mock`)[mockExport];
  expect(Object.keys(mock).sort()).toEqual(Object.keys(live).sort());
}

describe('Phase 0 — foundations', () => {
  it('ships the core design-system components', () => {
    const components = [
      'screen',
      'screen-header',
      'text',
      'button',
      'icon-button',
      'icon-tile',
      'card',
      'text-field',
      'select-field',
      'segmented-tabs',
      'status-pill',
      'step-indicator',
      'avatar',
      'states',
      'toast',
      'tab-bar',
      'rosette',
    ];
    for (const name of components) {
      expect(exists(`design-system/components/${name}.tsx`)).toBe(true);
    }
  });

  it('defines the theme tokens the screens use', () => {
    const { lightTheme } = require('../design-system/theme');
    expect(lightTheme.color.brand).toBe('#FE7B00');
    expect(lightTheme.color.action).toBe('#66783C');
    // Orange carries dark text: white on orange fails contrast (build-plan §6).
    expect(lightTheme.color.textOnBrand).toBe(lightTheme.color.text);
    expect(Object.keys(lightTheme.typography).length).toBeGreaterThan(10);
  });

  it('has an API layer with one error model and a per-feature mock switch', () => {
    const { FEATURES, isMocked, pickApi } = require('../api/mode');
    expect(FEATURES).toEqual(
      expect.arrayContaining([
        'auth',
        'membership',
        'payments',
        'donations',
        'newsEvents',
        'family',
        'support',
        'notifications',
      ])
    );
    expect(pickApi('membership', 'live', 'mock')).toBe(isMocked('membership') ? 'mock' : 'live');
    expect(exports_('api/client.ts', 'request')).toBe(true);
    expect(exports_('api/parse.ts', 'parseResponse')).toBe(true);
  });

  it('never sends features with no endpoints to the live API', () => {
    // Going live means EXPO_PUBLIC_API_MOCK=none. These three have no
    // endpoints, and `support` backs Login's "Forgot password?", so letting
    // them follow that setting would 404 three screens (docs/api-gaps.md §2).
    const { isMocked, FEATURES_WITHOUT_BACKEND } = require('../api/mode');
    expect([...FEATURES_WITHOUT_BACKEND].sort()).toEqual(['family', 'notifications', 'support']);
    for (const feature of FEATURES_WITHOUT_BACKEND) {
      expect(isMocked(feature)).toBe(true);
    }
  });

  it('persists only the membership card, so it opens offline', () => {
    const { persistOptions } = require('../api/query-client');
    const keep = persistOptions.dehydrateOptions.shouldDehydrateQuery;
    expect(keep({ queryKey: ['card'] })).toBe(true);
    expect(keep({ queryKey: ['news'] })).toBe(false);
  });

  it('routes the signed-out and signed-in areas separately', () => {
    for (const route of [
      'app/(auth)/welcome.tsx',
      'app/(auth)/login.tsx',
      'app/(app)/(tabs)/_layout.tsx',
      'app/index.tsx',
    ]) {
      expect(exists(route)).toBe(true);
    }
  });

  it('sets up i18n with English and a Somali bundle', () => {
    expect(exists('i18n/locales/en.json')).toBe(true);
    expect(exists('i18n/locales/so.json')).toBe(true);
  });
});

describe('Phase 1 — onboarding', () => {
  it('has the welcome, register, pending and login screens, no longer shells', () => {
    for (const route of ['welcome', 'register', 'pending', 'login']) {
      expect(exists(`app/(auth)/${route}.tsx`)).toBe(true);
      expect(source(`app/(auth)/${route}.tsx`)).not.toContain('Phase 0 shell');
    }
  });

  it('serves auth from live or mock alike', () => {
    apiSurfacesMatch('auth', 'authApi', 'authApiMock');
  });

  it('checks the password instead of waving anyone through (D1)', async () => {
    const { authApiMock, DEMO_PASSWORD } = require('../features/auth/api.mock');
    const { memberFixture } = require('../features/membership/api.mock');

    await expect(
      authApiMock.login({ identifier: memberFixture.email, password: 'wrong-password' })
    ).rejects.toMatchObject({ error: { kind: 'validation' } });

    const session = await authApiMock.login({
      identifier: memberFixture.email,
      password: DEMO_PASSWORD,
    });
    expect(session.memberId).toBe(memberFixture.id);
    expect(session.accessToken).toBeTruthy();
  });

  it('registers and pays in one call, and rejects a duplicate phone (D7)', async () => {
    const { authApiMock } = require('../features/auth/api.mock');
    const { planFixtures, periodFixtures } = require('../features/membership/api.mock');
    const payload = {
      fullName: 'Amina Yusuf',
      gender: 'female',
      phone: `+25263111${String(Date.now()).slice(-4)}`,
      email: `amina${Date.now()}@example.com`,
      photoUrl: 'https://wp-membership-bucket.s3.eu-north-1.amazonaws.com/a.jpg',
      education: 'bachelor',
      professionalWork: 'Teacher',
      birthYear: 1994,
      membershipTypeId: planFixtures[1].id,
      membershipPeriodId: periodFixtures[0].id,
      address: {
        line1: 'Jigjiga Yar',
        city: 'Hargeisa',
        region: 'Woqooyi Galbeed',
        country: 'Somaliland',
      },
      password: 'secret12345',
      charge: { method: 'WAAFI', amountUsd: 50, payerPhone: '+252631112222' },
    };

    // A wallet charge settles at once, so the card exists straight away.
    const result = await authApiMock.register(payload);
    expect(result.kind).toBe('registered');
    expect(result.member.status).toBe('cardIssued');
    expect(result.card.cardCode).toBeTruthy();

    await expect(authApiMock.register(payload)).rejects.toMatchObject({
      error: { fieldErrors: { phone: expect.any(String) } },
    });
  });

  it("shows a signed-in member's own card, not always the demo fixture", async () => {
    const { authApiMock } = require('../features/auth/api.mock');
    const { membershipApiMock, memberFixture } = require('../features/membership/api.mock');
    const { planFixtures, periodFixtures } = require('../features/membership/api.mock');

    const payload = {
      fullName: 'Eng Ladif',
      gender: 'male',
      phone: `+25263422${String(Date.now()).slice(-4)}`,
      education: 'bachelor',
      professionalWork: 'Engineer',
      birthYear: 1990,
      photoUrl: 'https://wp-membership-bucket.s3.eu-north-1.amazonaws.com/b.jpg',
      membershipTypeId: planFixtures[0].id,
      membershipPeriodId: periodFixtures[0].id,
      address: {
        line1: 'Koodbuur',
        city: 'Hargeisa',
        region: 'Maroodi Jeex',
        country: 'Somaliland',
      },
      password: '123456789',
      charge: { method: 'WAAFI', amountUsd: 25, payerPhone: '+252634220000' },
    };

    const registered = await authApiMock.register(payload);
    const card = await membershipApiMock.getCard();
    expect(card.memberFullName).toBe('Eng Ladif');
    expect(card.cardCode).toBe(registered.card.cardCode);
    // The bug was: getCard() always answered with the demo fixture, whoever
    // was actually signed in.
    expect(card.memberFullName).not.toBe(memberFixture.fullName);

    // Logging back in as the demo fixture has to show the fixture again, not
    // whoever registered most recently (this was the actual bug: getCard()
    // ignored who was signed in and always returned the fixture).
    await authApiMock.login({ identifier: memberFixture.phone, password: 'waddani123' });
    const demoCard = await membershipApiMock.getCard();
    expect(demoCard.memberFullName).toBe(memberFixture.fullName);

    // And logging back in as the member just created shows their card again.
    await authApiMock.login({ identifier: payload.phone, password: payload.password });
    const backToLadif = await membershipApiMock.getCard();
    expect(backToLadif.memberFullName).toBe('Eng Ladif');
  });

  it('holds a card payment back until Sifalo confirms it', async () => {
    const { authApiMock } = require('../features/auth/api.mock');
    const { planFixtures, periodFixtures } = require('../features/membership/api.mock');

    const result = await authApiMock.register({
      fullName: 'Card Payer',
      gender: 'male',
      phone: `+25263999${String(Date.now()).slice(-4)}`,
      photoUrl: 'https://wp-membership-bucket.s3.eu-north-1.amazonaws.com/b.jpg',
      education: 'other',
      professionalWork: 'Driver',
      birthYear: 1990,
      membershipTypeId: planFixtures[0].id,
      membershipPeriodId: periodFixtures[0].id,
      address: {
        line1: 'Koodbuur',
        city: 'Hargeisa',
        region: 'Maroodi Jeex',
        country: 'Somaliland',
      },
      password: 'secret12345',
      charge: { method: 'CARD', amountUsd: 25 },
    });

    expect(result.kind).toBe('checkout');
    expect(result.checkout.checkoutUrl).toContain('http');
  });

  it('keeps members without a settled payment out of the app (D2)', () => {
    const entry = source('app/index.tsx');
    expect(entry).toContain("'paymentPending'");
    expect(entry).toContain('/pending');
    expect(source('app/_layout.tsx')).toContain('awaitingReview');
  });

  it('validates each step on its own, against the backend contract (D9)', () => {
    const {
      personalSchema,
      addressSchema,
      paymentSchema,
      STEP_FIELDS,
      stepForField,
    } = require('../features/registration/form');

    expect(STEP_FIELDS).toHaveLength(4);
    // The backend requires region as well as city and country.
    expect(
      addressSchema.safeParse({ line1: 'Jigjiga Yar', city: 'Hargeisa', country: 'Somaliland' })
        .success
    ).toBe(false);

    const base = {
      fullName: 'Amina Yusuf',
      gender: 'female',
      phone: '+252 63 111 2222',
      email: 'amina@example.com',
      education: 'bachelor',
      professionalWork: 'Teacher',
      birthYear: '1998',
      password: 'secret12345',
    };
    expect(personalSchema.safeParse(base).success).toBe(true);
    // Birth year and work are required by the API, so they are required here.
    expect(personalSchema.safeParse({ ...base, birthYear: '' }).success).toBe(false);
    expect(personalSchema.safeParse({ ...base, birthYear: '98' }).success).toBe(false);
    expect(personalSchema.safeParse({ ...base, professionalWork: '' }).success).toBe(false);
    // Email is optional: the phone number is the identity.
    expect(personalSchema.safeParse({ ...base, email: undefined }).success).toBe(true);
    // The API's own minimum password length.
    expect(personalSchema.safeParse({ ...base, password: 'secret1' }).success).toBe(false);
    // A server-side clash sends the wizard back to the step holding the field (D7).
    expect(stepForField('email')).toBe(0);
    expect(stepForField('professionalWork')).toBe(0);
    expect(stepForField('address.region')).toBe(1);
    expect(stepForField('payerPhone')).toBe(3);

    // Consent is required before an account can be created (D11).
    const payment = { method: 'WAAFI', amount: '50', payerPhone: '+252631112222' };
    expect(paymentSchema.safeParse({ ...payment, acceptedTerms: false }).success).toBe(false);
    expect(paymentSchema.safeParse({ ...payment, acceptedTerms: true }).success).toBe(true);
    // A wallet charge needs a number to bill; a card payment does not.
    expect(
      paymentSchema.safeParse({ method: 'WAAFI', amount: '50', acceptedTerms: true }).success
    ).toBe(false);
    expect(
      paymentSchema.safeParse({ method: 'CARD', amount: '50', acceptedTerms: true }).success
    ).toBe(true);
  });

  it('uploads the member photo to S3 before registering (2026-09-19)', () => {
    // photoUrl is required by the API and must be a URL the backend can read,
    // so the picked file goes to the party's bucket first.
    const upload = source('features/registration/upload-photo.ts');
    expect(upload).toContain('putObject');
    expect(source('app/(auth)/register.tsx')).toContain('uploadMemberPhoto');
    // The key lives in config, never in the source.
    expect(source('lib/s3.ts')).not.toMatch(/AKIA[0-9A-Z]{16}/);
    expect(source('lib/env.ts')).toContain('EXPO_PUBLIC_AWS_ACCESS_KEY_ID');
  });

  it('never writes the password into the saved draft (D12)', () => {
    const { useDraftStore } = require('../features/registration/draft-store');
    const { emptyRegistration } = require('../features/registration/form');

    useDraftStore
      .getState()
      .save({ ...emptyRegistration, fullName: 'Amina', password: 'secret123' }, 1);
    const draft = useDraftStore.getState().draft;
    expect(draft).toMatchObject({ fullName: 'Amina', step: 1 });
    expect(JSON.stringify(draft)).not.toContain('secret123');
    useDraftStore.getState().clear();
    expect(useDraftStore.getState().draft).toBeNull();
  });

  it('drops an unfinished registration after a day, and one with no timestamp', () => {
    // The draft holds a person's details on a possibly shared phone.
    const {
      useDraftStore,
      readDraft,
      DRAFT_TTL_MS,
    } = require('../features/registration/draft-store');
    const { emptyRegistration } = require('../features/registration/form');

    useDraftStore.getState().save({ ...emptyRegistration, fullName: 'Amina' }, 1);
    expect(readDraft()).toMatchObject({ fullName: 'Amina' });

    // Still there just inside the window, gone just outside it, and deleted.
    expect(readDraft(Date.now() + DRAFT_TTL_MS - 60_000)).not.toBeNull();
    expect(readDraft(Date.now() + DRAFT_TTL_MS + 60_000)).toBeNull();
    expect(readDraft()).toBeNull();
    useDraftStore.getState().clear();
  });

  it('clears a half-finished registration when someone signs out', async () => {
    const { useSessionStore } = require('../features/auth/session-store');
    const { useDraftStore } = require('../features/registration/draft-store');
    const { emptyRegistration } = require('../features/registration/form');

    useDraftStore.getState().save({ ...emptyRegistration, fullName: 'Someone Else' }, 2);
    expect(useDraftStore.getState().draft).not.toBeNull();

    await useSessionStore.getState().signOut();
    expect(useDraftStore.getState().draft).toBeNull();
  });

  it('has the wording for every Phase 1 screen', () => {
    for (const key of [
      'welcome.title',
      'register.title',
      'register.consent',
      'register.submit',
      'pending.title',
      'pending.stepApproved',
      'login.forgotPassword',
    ]) {
      expect(hasText(key)).toBe(true);
    }
  });
});

describe('Phase 2 — membership core', () => {
  it('has the four tab screens plus communications', () => {
    for (const route of ['home', 'card', 'payments', 'profile']) {
      expect(exists(`app/(app)/(tabs)/${route}.tsx`)).toBe(true);
    }
    expect(exists('app/(app)/communications.tsx')).toBe(true);
  });

  it('builds the card from the member record, with save and share', () => {
    expect(exports_('features/membership/components/membership-card.tsx', 'MembershipCard')).toBe(
      true
    );
    expect(exports_('features/membership/components/mini-card.tsx', 'MiniCard')).toBe(true);
    expect(exports_('features/membership/use-card-actions.ts', 'useCardActions')).toBe(true);
    const actions = source('features/membership/use-card-actions.ts');
    expect(actions).toContain('captureRef');
    expect(actions).toContain('MediaLibrary.Asset.create');
    expect(actions).toContain('Sharing.shareAsync');
  });

  it('serves the member, payments and notifications from live or mock alike', () => {
    apiSurfacesMatch('membership', 'membershipApi', 'membershipApiMock');
    apiSurfacesMatch('payments', 'paymentsApi', 'paymentsApiMock');
    apiSurfacesMatch('notifications', 'notificationsApi', 'notificationsApiMock');
  });

  it('groups payment history by year and labels back-office methods too', () => {
    const { groupByYear, toPayment } = require('../features/payments/mappers');
    const { paymentFixtures } = require('../features/payments/api.mock');
    const { CHARGE_METHODS, paymentMethodLabel } = require('../features/payments/methods');
    expect(groupByYear(paymentFixtures.map(toPayment))[0].year).toBe(2026);
    // Every charge goes through Sifalo: four methods, and no cash (2026-09-19).
    expect(CHARGE_METHODS).toEqual(['WAAFI', 'EDAHAB', 'PREMIER_WALLET', 'CARD']);
    // History can still hold a method staff recorded by hand.
    expect(paymentMethodLabel('CASH')).toBe('Cash');
  });

  it('has the wording for every Phase 2 screen', () => {
    for (const key of [
      'home.greeting',
      'home.inviteTitle',
      'card.title',
      'card.scan',
      'card.saved',
      'payments.title',
      'payments.emptyTitle',
      'profile.memberSince',
      'profile.cardCode',
      'communications.title',
    ]) {
      expect(hasText(key)).toBe(true);
    }
  });
});

describe('Phase 3 — engagement', () => {
  it('has the news & events and contact screens, no longer placeholders', () => {
    expect(exists('app/(app)/news-events.tsx')).toBe(true);
    expect(exists('app/(app)/contact.tsx')).toBe(true);
    expect(source('app/(app)/news-events.tsx')).not.toContain('comingSoon');
    expect(source('app/(app)/contact.tsx')).not.toContain('comingSoon');
  });

  it('serves news, events and support from live or mock alike', () => {
    apiSurfacesMatch('news-events', 'newsEventsApi', 'newsEventsApiMock');
    apiSurfacesMatch('support', 'supportApi', 'supportApiMock');
  });

  it('does not offer RSVP: the API has no endpoint for it (party decision, 2026-09-19)', () => {
    expect(source('features/news-events/types.ts')).not.toContain('isGoing');
    expect(source('app/(app)/news-events.tsx')).not.toContain('rsvp');
  });

  it('opens the phone, mail, maps and WhatsApp', () => {
    const links = require('../features/support/links');
    for (const fn of ['callNumber', 'sendEmail', 'openMap', 'openWhatsApp']) {
      expect(typeof links[fn]).toBe('function');
    }
    expect(source('features/support/links.ts')).toContain('https://wa.me/');
  });

  it('answers the FAQs about what v1 actually does (D21)', () => {
    const { faqFixtures } = require('../features/support/api.mock');
    expect(faqFixtures.length).toBeGreaterThanOrEqual(5);
    const answers = faqFixtures
      .map((faq: { answer: string }) => faq.answer.toLowerCase())
      .join(' ');
    // The prototype promised an in-app Renew button and instant Zaad confirmation.
    expect(answers).not.toContain('tap renew');
    expect(answers).not.toContain('verified instantly');
  });

  it('has the wording for every Phase 3 screen', () => {
    for (const key of ['news.title', 'contact.title', 'contact.whatsappTitle', 'contact.hours']) {
      expect(hasText(key)).toBe(true);
    }
  });
});

describe('Phase 4 — family & donate', () => {
  it('has the donate screen, no longer a placeholder', () => {
    expect(exists('app/(app)/donate.tsx')).toBe(true);
    expect(source('app/(app)/donate.tsx')).not.toContain('comingSoon');
  });

  it('shows Family as coming soon: the API has no family endpoints (party decision, 2026-09-19)', () => {
    expect(exists('app/(app)/family.tsx')).toBe(true);
    expect(source('app/(app)/family.tsx')).toContain('comingSoon');
  });

  it('keeps the family data layer ready, mock matching live, for whenever the backend adds it', () => {
    apiSurfacesMatch('family', 'familyApi', 'familyApiMock');
  });

  it('serves donations from live or mock alike', () => {
    apiSurfacesMatch('donations', 'donationsApi', 'donationsApiMock');
  });

  it('adds a family member as pending, with no member ID yet (D24) — data layer, not yet wired to a screen', async () => {
    const { familyApiMock } = require('../features/family/api.mock');
    const added = await familyApiMock.addFamilyMember({
      fullName: 'Hodan Shibbin',
      relation: 'child',
    });
    expect(added).toMatchObject({
      fullName: 'Hodan Shibbin',
      relation: 'child',
      status: 'pending',
    });
    expect(added.memberId).toBeUndefined();
    expect((await familyApiMock.getFamily()).some((m: { id: string }) => m.id === added.id)).toBe(
      true
    );
  });

  it('offers the four relations from the prototype', () => {
    const { RELATIONS } = require('../features/family/types');
    expect(RELATIONS).toEqual(['spouse', 'child', 'parent', 'sibling']);
  });

  it('charges a donation through Sifalo rather than recording it (2026-09-19)', async () => {
    const { donationsApiMock } = require('../features/donations/api.mock');
    const result = await donationsApiMock.createDonation({
      amountUsd: 25,
      method: 'WAAFI',
      payerPhone: '+252631112222',
    });
    expect(result.kind).toBe('donated');
    expect(result.donation).toMatchObject({ amountUsd: 25, method: 'WAAFI' });
    expect(result.donation.reference).toBeTruthy();

    const card = await donationsApiMock.createDonation({ amountUsd: 25, method: 'CARD' });
    expect(card.kind).toBe('checkout');
  });

  it('accepts the quick amounts and rejects nonsense ones', () => {
    const { parseAmount, DONATION_PRESETS } = require('../features/donations');
    expect(DONATION_PRESETS).toEqual([5, 10, 25, 50]);
    expect(parseAmount('25.00')).toBe(25);
    expect(parseAmount('$7.5')).toBe(7.5);
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });

  it('has the wording for every Phase 4 screen', () => {
    for (const key of [
      'family.title',
      'family.add',
      'family.awaitingApproval',
      'relations.spouse',
      'donate.title',
      'donate.submit',
      'donate.thanksTitle',
    ]) {
      expect(hasText(key)).toBe(true);
    }
  });
});

describe('Phases 5–6 — release and payments', () => {
  it.todo('store release: icons, Sentry, accessibility pass, EAS Submit');
  it.todo('Zaad and eDahab gateways behind the payment registry, renewal, push');
});
