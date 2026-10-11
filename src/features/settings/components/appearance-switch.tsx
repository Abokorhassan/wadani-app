import { useTranslation } from 'react-i18next';

import { SegmentedTabs } from '@/design-system';

import { useAppearanceStore, type Appearance } from '../appearance';

/** System / Light / Dark. Applies straight away and is remembered on this phone. */
export function AppearanceSwitch() {
  const { t } = useTranslation();
  const appearance = useAppearanceStore((state) => state.appearance);
  const setAppearance = useAppearanceStore((state) => state.setAppearance);

  return (
    <SegmentedTabs<Appearance>
      testID="appearance-switch"
      value={appearance}
      onChange={setAppearance}
      items={[
        { key: 'system', label: t('profile.appearanceSystem') },
        { key: 'light', label: t('profile.appearanceLight') },
        { key: 'dark', label: t('profile.appearanceDark') },
      ]}
    />
  );
}
