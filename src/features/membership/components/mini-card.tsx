import { Image } from 'expo-image';
import { QrCode } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Rosette, StatusPill, Text, useTheme } from '@/design-system';

import type { Member } from '../types';

const sealBlack = require('@/assets/brand/seal-black.png');

export interface MiniCardProps {
  member: Member;
  onPress: () => void;
}

/** Compact membership card on Home; opens the full card. */
export function MiniCard({ member, onPress }: MiniCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('card.openCard')}
      style={({ pressed }) => [
        {
          height: 204,
          overflow: 'hidden',
          justifyContent: 'space-between',
          padding: 20,
          borderRadius: theme.radius.hero,
          backgroundColor: theme.color.brand,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        theme.shadow.brand,
      ]}>
      <View style={{ position: 'absolute', right: -150, top: -150 }}>
        <Rosette size={340} color={theme.color.text} opacity={0.1} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image source={sealBlack} style={{ width: 36, height: 36 }} />
          <View style={{ gap: 1 }}>
            <Text variant="overline" color="textOnBrand">
              {t('card.membershipCard')}
            </Text>
            <Text variant="captionStrong" color="textOnBrandSoft">
              {t('common.partyName')}
            </Text>
          </View>
        </View>
        <StatusPill label={t(`status.${member.status}`)} tone="ink" dot />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
        }}>
        <View style={{ flex: 1, alignItems: 'flex-start', gap: 6 }}>
          <StatusPill label={member.plan.name} tone="onBrand" />
          <Text
            variant="display"
            color="textOnBrand"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ fontSize: 26, lineHeight: 30 }}>
            {member.fullName}
          </Text>
          <Text variant="mono" color="textOnBrand" style={{ fontSize: 14, lineHeight: 18 }}>
            {member.id}
          </Text>
        </View>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.color.surfaceInk,
          }}>
          <QrCode size={24} color={theme.color.textOnInk} />
        </View>
      </View>
    </Pressable>
  );
}
