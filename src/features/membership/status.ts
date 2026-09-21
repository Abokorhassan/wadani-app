import type { StatusTone } from '@/design-system';

import type { MemberStatus } from './types';

export const MEMBER_STATUS_TONE: Record<MemberStatus, StatusTone> = {
  registered: 'warning',
  paymentPending: 'warning',
  paid: 'success',
  cardIssued: 'success',
};

/** Not confirmed yet (build-plan D18). */
export const SOCIAL_HANDLE = '@WaddaniParty';

/** The card carries its own expiry; the member record may not be on disk. */
export function isExpired(card: { validUntil: string }): boolean {
  const until = Date.parse(card.validUntil);
  return Number.isFinite(until) && until < Date.now();
}
