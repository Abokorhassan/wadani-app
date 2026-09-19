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

  it('persists only the member record, so the card opens offline', () => {
    const { persistOptions } = require('../api/query-client');
    const keep = persistOptions.dehydrateOptions.shouldDehydrateQuery;
    expect(keep({ queryKey: ['me'] })).toBe(true);
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
    expect(session.member.id).toBe(memberFixture.id);
    expect(session.accessToken).toBeTruthy();
  });

  it('registers a member as pending, and rejects a duplicate email (D7)', async () => {
    const { authApiMock } = require('../features/auth/api.mock');
    const payload = {
      fullName: 'Amina Yusuf',
      gender: 'female',
      phone: '+252 63 111 2222',
      email: `amina${Date.now()}@example.com`,
      education: 'bachelor',
      password: 'secret123',
      address: { country: 'Somaliland', city: 'Hargeisa' },
      planId: 'silver',
      periodId: '1y',
      payment: { method: 'zaad', amountUsd: 50, account: '+252 63 111 2222', reference: 'TX-1' },
      acceptedTerms: true,
    };

    const session = await authApiMock.register(payload);
    expect(session.member.status).toBe('pending');

    await expect(authApiMock.register(payload)).rejects.toMatchObject({
      error: { fieldErrors: { email: expect.any(String) } },
    });
  });

  it('keeps members waiting for approval out of the app (D2)', () => {
    const entry = source('app/index.tsx');
    expect(entry).toContain("'pending'");
    expect(entry).toContain('/pending');
    expect(source('app/_layout.tsx')).toContain('awaitingReview');
  });

  it('validates each step on its own, including the optional birth year (D9)', () => {
    const {
      personalSchema,
      addressSchema,
      paymentSchema,
      STEP_FIELDS,
      stepForField,
    } = require('../features/registration/form');

    expect(STEP_FIELDS).toHaveLength(4);
    expect(addressSchema.safeParse({ country: 'Somaliland', city: '' }).success).toBe(false);
    // Birth year may be left out, but a stray value has to be a real year.
    const base = {
      fullName: 'Amina Yusuf',
      gender: 'female',
      phone: '+252 63 111 2222',
      email: 'amina@example.com',
      education: 'bachelor',
      password: 'secret123',
    };
    expect(personalSchema.safeParse(base).success).toBe(true);
    expect(personalSchema.safeParse({ ...base, birthYear: '98' }).success).toBe(false);
    expect(personalSchema.safeParse({ ...base, birthYear: '1998' }).success).toBe(true);
    // A server-side email clash sends the wizard back to the first step (D7).
    expect(stepForField('email')).toBe(0);
    expect(stepForField('reference')).toBe(3);

    // Consent is required before an account can be created (D11).
    const payment = { method: 'zaad', amount: '50', account: '+252', reference: 'TX-1' };
    expect(paymentSchema.safeParse({ ...payment, acceptedTerms: false }).success).toBe(false);
    expect(paymentSchema.safeParse({ ...payment, acceptedTerms: true }).success).toBe(true);
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

  it('groups payment history by year and knows every payment method', () => {
    const { groupByYear, toPayment } = require('../features/payments/mappers');
    const { paymentFixtures } = require('../features/payments/api.mock');
    const { PAYMENT_METHODS } = require('../features/payments/methods');
    expect(groupByYear(paymentFixtures.map(toPayment))[0].year).toBe(2026);
    expect(Object.keys(PAYMENT_METHODS)).toHaveLength(5);
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

  it('updates an RSVP straight away and puts it back when the call fails', () => {
    const hooks = source('features/news-events/hooks.ts');
    expect(hooks).toContain('onMutate');
    expect(hooks).toContain('setQueryData');
    expect(hooks).toContain('onError');
    expect(hooks).toContain('context.previous');
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
    for (const key of [
      'news.title',
      'news.rsvp',
      'news.going',
      'contact.title',
      'contact.whatsappTitle',
      'contact.hours',
    ]) {
      expect(hasText(key)).toBe(true);
    }
  });
});

describe('Phase 4 — family & donate', () => {
  it('has the family and donate screens, no longer placeholders', () => {
    expect(exists('app/(app)/family.tsx')).toBe(true);
    expect(exists('app/(app)/donate.tsx')).toBe(true);
    expect(source('app/(app)/family.tsx')).not.toContain('comingSoon');
    expect(source('app/(app)/donate.tsx')).not.toContain('comingSoon');
  });

  it('serves family and donations from live or mock alike', () => {
    apiSurfacesMatch('family', 'familyApi', 'familyApiMock');
    apiSurfacesMatch('donations', 'donationsApi', 'donationsApiMock');
  });

  it('adds a family member as pending, with no member ID yet (D24)', async () => {
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

  it('records a donation as pending for the office to confirm (D25)', async () => {
    const { donationsApiMock } = require('../features/donations/api.mock');
    const donation = await donationsApiMock.createDonation({ amountUsd: 25, method: 'zaad' });
    expect(donation).toMatchObject({ amountUsd: 25, method: 'zaad', status: 'pending' });
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
