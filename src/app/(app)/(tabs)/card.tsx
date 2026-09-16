import { IdCard } from 'lucide-react-native';

import { EmptyState, Screen } from '@/design-system';

export default function CardScreen() {
  return (
    <Screen>
      <EmptyState
        icon={IdCard}
        title="My Card"
        message="The digital membership card, QR code and sharing are built in Phase 2."
      />
    </Screen>
  );
}
