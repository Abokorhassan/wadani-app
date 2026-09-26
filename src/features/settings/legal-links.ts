import { Linking } from 'react-native';

import { env } from '@/lib/env';

/**
 * The party's public legal pages (platform web app, src/routes/LegalPages.tsx).
 * Google Play needs the same privacy and account-deletion URLs in the listing.
 */
export const LEGAL_URLS = {
  privacy: `${env.siteUrl}/privacy`,
  terms: `${env.siteUrl}/terms`,
  deleteAccount: `${env.siteUrl}/delete-account`,
} as const;

export type LegalPage = keyof typeof LEGAL_URLS;

export function openLegalPage(page: LegalPage): void {
  // No browser on the device: nothing useful to do.
  Linking.openURL(LEGAL_URLS[page]).catch(() => {});
}
