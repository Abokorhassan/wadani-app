import { Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text, useTheme } from '@/design-system';
import { LANGUAGE_NAMES, setLanguage, SUPPORTED_LANGUAGES, toLanguage } from '@/i18n';

export interface LanguageSwitchProps {
  /** `brand` sits on the orange welcome screen; `surface` on light screens. */
  tone?: 'brand' | 'surface';
  /** Leading globe icon; off where a row already says "Language". */
  icon?: boolean;
}

/** Compact EN | SO pill. The choice is saved and applies straight away. */
export function LanguageSwitch({ tone = 'surface', icon = true }: LanguageSwitchProps) {
  const theme = useTheme();
  // Read the language through the hook: the React Compiler memoises this
  // component, so reading i18next directly would never show a change.
  const { i18n } = useTranslation();
  const current = toLanguage(i18n.resolvedLanguage);
  const onBrand = tone === 'brand';

  // Orange takes ink, never white (build-plan §6), so the track is a light ink wash.
  const trackColor = onBrand ? 'rgba(26, 21, 18, 0.14)' : theme.color.surfaceSunken;
  const idleColor = onBrand ? theme.color.textOnBrand : theme.color.textMuted;

  return (
    <View
      testID="language-switch"
      accessibilityRole="radiogroup"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 2,
        height: 38,
        padding: 3,
        borderRadius: theme.radius.pill,
        backgroundColor: trackColor,
      }}>
      {icon ? (
        <View style={{ paddingLeft: 8, paddingRight: 4 }}>
          <Globe size={16} color={idleColor} strokeWidth={2} />
        </View>
      ) : null}
      {SUPPORTED_LANGUAGES.map((language) => {
        const active = language === current;
        return (
          <Pressable
            key={language}
            onPress={() => setLanguage(language)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={LANGUAGE_NAMES[language]}
            hitSlop={{ top: 6, bottom: 6 }}
            style={[
              {
                minWidth: 44,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
                borderRadius: theme.radius.pill,
                backgroundColor: active ? theme.color.surfaceSelected : 'transparent',
              },
              active ? theme.shadow.raised : null,
            ]}>
            <Text
              variant="captionStrong"
              style={{
                fontSize: 13,
                letterSpacing: 0.8,
                color: active ? theme.color.text : idleColor,
                fontFamily: active ? theme.fonts.text700 : theme.fonts.text600,
              }}>
              {language.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
