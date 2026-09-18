import { Banknote, Landmark, Send, Smartphone, type LucideIcon } from 'lucide-react-native';

import type { IconTileTone } from '@/design-system';

import type { PaymentMethodId } from './types';

export interface PaymentMethodInfo {
  id: PaymentMethodId;
  /** Brand names are not translated. */
  label: string;
  icon: LucideIcon;
  tone: IconTileTone;
}

/**
 * Display metadata for each method. The payment registry from build-plan §5
 * (manual vs gateway handlers) builds on this in Phase 6.
 */
export const PAYMENT_METHODS: Record<PaymentMethodId, PaymentMethodInfo> = {
  cash: { id: 'cash', label: 'Cash', icon: Banknote, tone: 'action' },
  zaad: { id: 'zaad', label: 'Zaad', icon: Smartphone, tone: 'brand' },
  edahab: { id: 'edahab', label: 'eDahab', icon: Smartphone, tone: 'accent' },
  dahabshiil: { id: 'dahabshiil', label: 'Dahabshiil', icon: Send, tone: 'neutral' },
  premier_bank: { id: 'premier_bank', label: 'Premier Bank', icon: Landmark, tone: 'neutral' },
};
