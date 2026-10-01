import { Globe } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { FacebookIcon, Text, TikTokIcon, useTheme, XIcon } from '@/design-system';

import { SOCIAL_LINKS, type SocialNetwork } from '../social-links';

type IconProps = { size?: number; color: string };

function GlobeIcon({ size, color }: IconProps) {
  return <Globe size={size} color={color} strokeWidth={1.8} />;
}

/** Brand names stay as they are; the website's label is translated. */
const NETWORKS: { key: SocialNetwork; label?: string; Icon: ComponentType<IconProps> }[] = [
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
  { key: 'x', label: 'X', Icon: XIcon },
  { key: 'website', Icon: GlobeIcon },
];

/**
 * "Follow the party": one button per account that has a link in
 * social-links.ts. Renders nothing until at least one is filled in.
 */
export function SocialLinksCard({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const networks = NETWORKS.filter(({ key }) => SOCIAL_LINKS[key]);
  if (networks.length === 0) return null;

  return (
    <View
      style={[
        {
          gap: theme.spacing.md,
          padding: 16,
          borderRadius: theme.radius.card,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.surface,
        },
        style,
      ]}>
      <View style={{ gap: 2 }}>
        <Text variant="bodyStrong">{t('profile.follow')}</Text>
        <Text variant="caption" color="textMuted">
          {t('profile.followHint')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        {networks.map(({ key, label, Icon }) => (
          <Pressable
            key={key}
            onPress={() => Linking.openURL(SOCIAL_LINKS[key]).catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel={label ?? t('profile.website')}
            style={({ pressed }) => ({
              width: 52,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.md,
              // Ink on orange: white would fail contrast (AGENTS.md).
              backgroundColor: theme.color.brand,
              opacity: pressed ? 0.8 : 1,
            })}>
            <Icon size={24} color={theme.color.textOnBrand} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
