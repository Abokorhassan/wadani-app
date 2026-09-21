import { Image } from 'expo-image';
import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Line } from 'react-native-svg';

import { Avatar, Rosette, StatusPill, Text, useTheme } from '@/design-system';
import { formatMonthYear } from '@/lib/format';

import { isExpired, SOCIAL_HANDLE } from '../status';
import type { MemberCard } from '../types';
import { FacebookIcon, InstagramIcon, XIcon } from './social-icons';

const sealBlack = require('@/assets/brand/seal-black.png');

export interface MembershipCardProps {
  card: MemberCard;
  /** The inner card surface, captured for Save / Share. */
  ref?: Ref<View>;
}

/** The full ticket-style membership card shown at check-in. */
export function MembershipCard({ card, ref }: MembershipCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const expired = isExpired(card);

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
        }}>
        {/* Orange band */}
        <View
          style={{
            height: 188,
            overflow: 'hidden',
            padding: 22,
            backgroundColor: theme.color.brand,
          }}>
          <View style={{ position: 'absolute', right: -150, top: -170 }}>
            <Rosette size={420} color={theme.color.text} opacity={0.14} layers={5} waves={16} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image
              source={sealBlack}
              style={{ width: 46, height: 46 }}
              accessibilityLabel={t('common.partyName')}
            />
            <View style={{ gap: 2 }}>
              <Text variant="brand" color="textOnBrand" style={{ fontSize: 17, lineHeight: 20 }}>
                {t('common.partyNameCaps')}
              </Text>
              <Text variant="captionStrong" color="textOnBrandSoft">
                {t('common.partyTagline')}
              </Text>
            </View>
          </View>
          <Text
            variant="overline"
            color="textOnBrand"
            style={{ position: 'absolute', right: 22, bottom: 18 }}>
            {t('card.membershipCard')}
          </Text>
        </View>

        <Avatar
          name={card.memberFullName}
          uri={card.photoUrl}
          size={108}
          radius={30}
          style={{
            position: 'absolute',
            left: 22,
            top: 132,
            borderWidth: 5,
            borderColor: theme.color.surface,
          }}
        />

        {/* Identity */}
        <View style={{ paddingTop: 70, paddingHorizontal: 22 }}>
          <Text variant="display" numberOfLines={2}>
            {card.memberFullName}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            <StatusPill label={t('card.tierMember', { tier: card.membershipType })} tone="ink" />
            <StatusPill
              label={expired ? t('status.expired') : t('status.active')}
              tone={expired ? 'danger' : 'success'}
              dot
            />
          </View>
          {expired ? (
            <Text
              variant="caption"
              color="danger"
              style={{ marginTop: 10, fontFamily: theme.fonts.text600 }}>
              {t('card.expiredNote')}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="overline" color="textMuted">
                {t('card.memberId')}
              </Text>
              <Text variant="mono" style={{ fontSize: 17, lineHeight: 22 }}>
                {card.cardCode}
              </Text>
            </View>
            {card.validUntil ? (
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="overline" color="textMuted">
                  {t('card.validUntil')}
                </Text>
                <Text variant="bodyStrong" style={{ fontSize: 17, lineHeight: 22 }}>
                  {formatMonthYear(card.validUntil)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Tear line */}
        <View style={{ height: 26, marginTop: 22, justifyContent: 'center' }}>
          <Svg height={2} style={{ marginHorizontal: 22 }}>
            <Line
              x1="0"
              y1="1"
              x2="100%"
              y2="1"
              stroke={theme.color.ticketBorder}
              strokeWidth={2}
              strokeDasharray="6 5"
            />
          </Svg>
          <View
            style={[
              notch,
              {
                left: -14,
                backgroundColor: theme.color.background,
                borderColor: theme.color.ticketBorder,
              },
            ]}
          />
          <View
            style={[
              notch,
              {
                right: -14,
                backgroundColor: theme.color.background,
                borderColor: theme.color.ticketBorder,
              },
            ]}
          />
        </View>

        {/* QR */}
        <View
          style={{
            alignItems: 'center',
            gap: 12,
            paddingTop: 16,
            paddingHorizontal: 22,
            paddingBottom: 22,
          }}>
          <View
            style={{
              padding: 12,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.color.ticketBorder,
              backgroundColor: '#FFFFFF',
            }}>
            <QRCode
              value={card.cardCode}
              size={168}
              color={theme.color.text}
              backgroundColor="#FFFFFF"
            />
          </View>
          <Text variant="caption" color="textMuted" style={{ fontFamily: theme.fonts.text600 }}>
            {t('card.scan')}
          </Text>
        </View>

        {/* Socials */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: theme.color.ticketBorder,
            backgroundColor: theme.color.ticketFooter,
          }}>
          <FacebookIcon color={theme.color.textSecondary} />
          <XIcon color={theme.color.textSecondary} />
          <InstagramIcon color={theme.color.textSecondary} />
          <Text variant="caption" color="textSecondary" style={{ fontFamily: theme.fonts.text700 }}>
            {SOCIAL_HANDLE}
          </Text>
        </View>
      </View>
    </View>
  );
}

const notch = {
  position: 'absolute',
  top: 0,
  width: 26,
  height: 26,
  borderRadius: 13,
  borderWidth: 1,
} as const;
