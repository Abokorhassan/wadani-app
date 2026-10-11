import { Moon, Sun } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useTheme } from '@/design-system';

import { useAppearanceStore } from '../appearance';

export interface AppearanceToggleProps {
  /** `brand` sits on the orange welcome screen; `surface` on light and dark pages. */
  tone?: 'brand' | 'surface';
}

/**
 * One tap between light and dark, for the screens a visitor sees before there is
 * an account. It shows what a tap will switch to. Profile has the full choice,
 * including following the phone.
 */
export function AppearanceToggle({ tone = 'surface' }: AppearanceToggleProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const setAppearance = useAppearanceStore((state) => state.setAppearance);
  const dark = theme.mode === 'dark';
  const onBrand = tone === 'brand';

  // Same track as the language pill beside it: an ink wash on orange (white would
  // fail contrast there), the sunken surface everywhere else.
  const track = onBrand ? 'rgba(26, 21, 18, 0.14)' : theme.color.surfaceSunken;
  const ink = onBrand ? theme.color.textOnBrand : theme.color.textMuted;
  const Icon = dark ? Sun : Moon;

  return (
    <Pressable
      onPress={() => setAppearance(dark ? 'light' : 'dark')}
      accessibilityRole="button"
      accessibilityLabel={dark ? t('profile.switchToLight') : t('profile.switchToDark')}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        backgroundColor: track,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Icon size={18} color={ink} strokeWidth={2} />
    </Pressable>
  );
}
