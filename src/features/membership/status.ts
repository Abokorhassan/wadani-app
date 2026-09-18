import type { StatusTone } from '@/design-system';

import type { MembershipStatus } from './types';

export const MEMBER_STATUS_TONE: Record<MembershipStatus, StatusTone> = {
  active: 'success',
  pending: 'warning',
  rejected: 'danger',
  expired: 'danger',
};

/** Not confirmed yet (build-plan D18). */
export const SOCIAL_HANDLE = '@WaddaniParty';
