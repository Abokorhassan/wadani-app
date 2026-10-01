import { router } from 'expo-router';

import { env } from '@/lib/env';

export const LEGAL_PAGES = ['privacy', 'terms', 'deleteAccount'] as const;

export type LegalPage = (typeof LEGAL_PAGES)[number];

export const isLegalPage = (value: unknown): value is LegalPage =>
  LEGAL_PAGES.includes(value as LegalPage);

/**
 * The same pages on the party's website (platform web app,
 * src/routes/LegalPages.tsx). The app shows its own copy; Google Play needs
 * these public URLs in the listing.
 */
export const LEGAL_URLS: Record<LegalPage, string> = {
  privacy: `${env.siteUrl}/privacy`,
  terms: `${env.siteUrl}/terms`,
  deleteAccount: `${env.siteUrl}/delete-account`,
};

/** Where members send questions and deletion requests, as on the website. */
export const LEGAL_CONTACT = {
  email: 'wadaniparty2026@gmail.com',
  whatsapp: '+252 65 3140475',
} as const;

/** When the in-app text last changed; shown under each page's title. */
export const LEGAL_UPDATED = '2026-09-29';

/** Opens a legal page inside the app, from anywhere, signed in or not. */
export function openLegalPage(page: LegalPage): void {
  router.push({ pathname: '/legal/[page]', params: { page } });
}
