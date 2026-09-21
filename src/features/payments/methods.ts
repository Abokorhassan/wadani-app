import { CreditCard, Smartphone, Wallet, type LucideIcon } from 'lucide-react-native';

import type { IconTileTone } from '@/design-system';

import type { ChargeMethod, PaymentMethod } from './types';

export interface PaymentMethodInfo {
  id: ChargeMethod;
  /** Brand names are not translated. */
  label: string;
  icon: LucideIcon;
  tone: IconTileTone;
}

/**
 * What a member can pay with. Sifalo's WAAFI channel covers ZAAD, EVC, eSAHAL,
 * CASHPLUS and JEEB, which is why Zaad has no entry of its own.
 */
export const PAYMENT_METHODS: Record<ChargeMethod, PaymentMethodInfo> = {
  WAAFI: { id: 'WAAFI', label: 'Zaad / Waafi', icon: Smartphone, tone: 'brand' },
  EDAHAB: { id: 'EDAHAB', label: 'eDahab', icon: Smartphone, tone: 'accent' },
  PREMIER_WALLET: { id: 'PREMIER_WALLET', label: 'Premier Wallet', icon: Wallet, tone: 'action' },
  CARD: { id: 'CARD', label: 'Card', icon: CreditCard, tone: 'neutral' },
};

export const CHARGE_METHODS = Object.keys(PAYMENT_METHODS) as ChargeMethod[];

/** Wallet methods are charged straight away; CARD goes through a checkout page. */
export const isWalletMethod = (method: ChargeMethod): boolean => method !== 'CARD';

/** History can contain methods the app itself never offers, so label them all. */
const LEGACY_LABELS: Record<string, string> = {
  ONLINE: 'Online',
  CASH: 'Cash',
  ZAAD: 'Zaad',
  DARASALAAM: 'Darasalaam',
  DAHABSHIIL: 'Dahabshiil',
  PREMIER_BANK: 'Premier Bank',
};

export function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHODS[method as ChargeMethod]?.label ?? LEGACY_LABELS[method] ?? method;
}

export function paymentMethodIcon(method: PaymentMethod): LucideIcon {
  return PAYMENT_METHODS[method as ChargeMethod]?.icon ?? Wallet;
}

export function paymentMethodTone(method: PaymentMethod): IconTileTone {
  return PAYMENT_METHODS[method as ChargeMethod]?.tone ?? 'neutral';
}
