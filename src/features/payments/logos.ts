import type { ImageSourcePropType } from 'react-native';

import type { ChargeMethod } from './types';

/**
 * Provider logos, supplied by the party (2026-09-21) and stored as 256 px
 * square app icons in `assets/payment/`. The picker shows them as rounded tiles.
 *
 * A brand's logo is its trademark, so replace these only with files from the
 * provider itself, never a redrawn copy. A method missing from this map falls
 * back to a monogram tile.
 *
 * Card has none on purpose: the Visa and Mastercard marks come with their own
 * usage rules, so it shows a plain card icon until official artwork is chosen.
 */
export interface PaymentLogo {
  source: ImageSourcePropType;
  /**
   * Artwork that runs to the edge of its file would be clipped by the tile's
   * rounded corners, so it is inset and the gap filled with the logo's own
   * background colour. Full-bleed icons (eDahab) need neither.
   */
  inset?: number;
  background?: string;
}

export const PAYMENT_LOGOS: Partial<Record<ChargeMethod, PaymentLogo>> = {
  WAAFI: { source: require('@/assets/payment/waafi.png'), inset: 5, background: '#FDFDFD' },
  EDAHAB: { source: require('@/assets/payment/edahab.png') },
  PREMIER_WALLET: {
    source: require('@/assets/payment/premier-wallet.png'),
    inset: 4,
    background: '#162F4E',
  },
};
