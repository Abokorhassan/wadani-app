import { CreditCard } from 'lucide-react-native';

import { EmptyState, Screen } from '@/design-system';

export default function PaymentsScreen() {
  return (
    <Screen>
      <EmptyState
        icon={CreditCard}
        title="Payment History"
        message="Your membership payments appear here once Phase 2 is built."
      />
    </Screen>
  );
}
