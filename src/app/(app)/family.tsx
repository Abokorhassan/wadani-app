import { Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState, Screen, ScreenHeader } from '@/design-system';

/**
 * Deferred: the backend has no family-member endpoints yet
 * (docs/api-gaps.md, question 1). The working list-and-add screen this
 * replaced is still in src/features/family/ for when they land.
 */
export default function FamilyScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader back title={t('family.title')} />
      <View style={{ marginTop: 32 }}>
        <EmptyState icon={Users} title={t('comingSoon.title')} message={t('comingSoon.text')} />
      </View>
    </Screen>
  );
}
