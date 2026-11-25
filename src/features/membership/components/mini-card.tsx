import { Image } from 'expo-image';
import { QrCode } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Rosette, StatusPill, Text, useTheme } from '@/design-system';

import { useCardTranslation } from '../card-language';
import { isExpired } from '../status';
import type { MemberCard } from '../types';

const sealBlack = require('@/assets/brand/seal-black.png');

export interface MiniCardProps {
  card: MemberCard;
  onPress: () => void;
}

/** Compact membership card on Home; opens the full card. */
export function MiniCard({ card, onPress }: MiniCardProps) {
  const theme = useTheme();
  const t = useCardTranslation();
  const expired = isExpired(card);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('card.openCard')}
      style={({ pressed }) => [
        {
          // Sized by its content: a fixed height left an empty band in the middle.
          gap: 26,
          overflow: 'hidden',
          padding: 20,
          borderRadius: theme.radius.hero,
          backgroundColor: theme.color.brand,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        theme.shadow.brand,
      ]}>
      <View style={{ position: 'absolute', right: -150, top: -150 }}>
        <Rosette size={340} color={theme.color.textOnBrand} opacity={0.1} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}>
        {/* Shrinks so the pill keeps its place: in Somali both run long. */}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image source={sealBlack} style={{ width: 36, height: 36 }} />
          <View style={{ flex: 1, gap: 1 }}>
            <Text
              variant="overline"
              color="textOnBrand"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}>
              {t('card.membershipCard')}
            </Text>
            <Text variant="captionStrong" color="textOnBrandSoft" numberOfLines={1}>
              {t('common.partyName')}
            </Text>
          </View>
        </View>
        <View style={{ flexShrink: 0 }}>
          <StatusPill label={expired ? t('status.expired') : t('status.active')} tone="ink" dot />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
        }}>
        <View style={{ flex: 1, alignItems: 'flex-start', gap: 6 }}>
          <StatusPill label={card.membershipType} tone="onBrand" />
          <Text
            variant="display"
            color="textOnBrand"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ fontSize: 26, lineHeight: 30 }}>
            {card.memberFullName}
          </Text>
          <Text variant="mono" color="textOnBrand" style={{ fontSize: 14, lineHeight: 18 }}>
            {card.cardCode}
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
