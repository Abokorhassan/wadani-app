import { Image } from 'expo-image';
import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text, useTheme, WhatsAppIcon } from '@/design-system';
import { env } from '@/lib/env';

const officeStamp = require('@/assets/brand/office-stamp.jpg');
const sealColor = require('@/assets/brand/seal-color.png');
const wordmarkBlack = require('@/assets/brand/wordmark-black.png');

export interface MembershipCardBackProps {
  ref?: Ref<View>;
}

/** The reverse of the printed membership card: ownership notice + return instructions. */
export function MembershipCardBack({ ref }: MembershipCardBackProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[{ borderRadius: 30 }, theme.shadow.ticket]}>
      <View
        ref={ref}
        collapsable={false}
        style={{
          overflow: 'hidden',
          borderRadius: 30,
          borderWidth: 1,
          borderColor: theme.color.ticketBorder,
          backgroundColor: theme.color.surface,
          paddingHorizontal: 26,
          paddingTop: 34,
          paddingBottom: 30,
          minHeight: 560,
        }}>
        {/* Seal + wordmark */}
        <View style={{ alignItems: 'center', gap: 16 }}>
          <Image source={sealColor} style={{ width: 96, height: 96 }} contentFit="contain" />
          <Image
            source={wordmarkBlack}
            style={{ width: 210, aspectRatio: 834 / 278 }}
            contentFit="contain"
          />
          <Text
            variant="captionStrong"
            center
            style={{
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: theme.color.text,
            }}>
            {t('common.partyTagline')}
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 2,
            marginTop: 20,
            marginBottom: 22,
            borderRadius: 1,
            backgroundColor: theme.color.text,
          }}
        />

        {/* Ownership notice */}
        <Text
          variant="body"
          center
          style={{ fontSize: 19, lineHeight: 28, color: theme.color.text }}>
          {t('cardBack.exclusive')}
        </Text>

        {/* Return instructions */}
        <Text
          variant="body"
          center
          style={{ fontSize: 18, lineHeight: 27, marginTop: 20, color: theme.color.text }}>
          {t('cardBack.ifFound')}
        </Text>

        {/* Party WhatsApp, for whoever finds the card */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 22,
          }}>
          <WhatsAppIcon size={34} color={theme.color.text} />
          <Text variant="heading" style={{ fontSize: 20, color: theme.color.text }}>
            {formatWhatsApp(env.partyWhatsApp)}
          </Text>
        </View>

        {/* Membership-office stamp, bottom-right */}
        <View style={{ flex: 1 }} />
        <View style={{ alignItems: 'flex-end' }}>
          <Image
            source={officeStamp}
            style={{ width: 120, height: 120 }}
            contentFit="contain"
            accessibilityLabel={t('cardBack.stampLabel')}
          />
        </View>
      </View>
    </View>
  );
}

/** "252634001122" -> "+252 63 400 1122" for display. */
function formatWhatsApp(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.startsWith('252') && d.length === 12) {
    return `+252 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  }
  return `+${d}`;
}
