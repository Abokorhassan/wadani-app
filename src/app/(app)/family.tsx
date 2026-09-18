import { Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState, Screen, ScreenHeader } from '@/design-system';

/** Placeholder until this feature's phase ships (build-plan §7). */
export default function FamilyScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader back title={t('home.tiles.family')} />
      <View style={{ marginTop: 32 }}>
        <EmptyState icon={Users} title={t('comingSoon.title')} message={t('comingSoon.text')} />
      </View>
    </Screen>
  );
}
