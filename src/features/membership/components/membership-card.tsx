import { Image } from 'expo-image';
import { Globe } from 'lucide-react-native';
import type { ComponentType, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {
  Avatar,
  FacebookIcon,
  StatusPill,
  Text,
  TikTokIcon,
  useTheme,
  XIcon,
} from '@/design-system';

import { isExpired, SOCIAL_HANDLE } from '../status';
import type { MemberCard } from '../types';

const sealColor = require('@/assets/brand/seal-color.png');
const wordmarkBlack = require('@/assets/brand/wordmark-black.png');

/** Orange ring around the photo; its top half rises above the orange panel. */
const PHOTO = 150;
const RING = PHOTO + 22;
const FOOTER_HEIGHT = 56;
const BADGE = 84;

export interface MembershipCardProps {
  card: MemberCard;
  /** The plan's badge, when the backend has one for it. */
  badgeUrl?: string;
  /** The inner card surface, captured for Save / Share. */
  ref?: Ref<View>;
}

/** The full membership card shown at check-in, after the party's printed card. */
export function MembershipCard({ card, badgeUrl, ref }: MembershipCardProps) {
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
        {/* Seal and wordmark */}
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={`${t('common.partyName')}, ${t('common.partyTagline')}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            paddingTop: 26,
            paddingHorizontal: 22,
          }}>
          <Image source={sealColor} style={{ width: 66, height: 66 }} />
          <Image
            source={wordmarkBlack}
            style={{ width: 168, aspectRatio: 834 / 278 }}
            contentFit="contain"
          />
        </View>

        {/* Orange panel, with the photo riding on its top edge */}
        <View style={{ marginTop: 26, alignItems: 'center', paddingHorizontal: 22 }}>
          <View
            style={{
              position: 'absolute',
              top: RING * 0.45,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              backgroundColor: theme.color.brand,
            }}
          />
          <View
            style={{
              width: RING,
              height: RING,
              borderRadius: RING / 2,
              padding: 7,
              backgroundColor: theme.color.brand,
            }}>
            <View
              style={{
                flex: 1,
                padding: 4,
                borderRadius: RING / 2,
                backgroundColor: theme.color.surface,
              }}>
              <Avatar name={card.memberFullName} uri={card.photoUrl} size={PHOTO} />
            </View>
          </View>

          <Text
            variant="headline"
            color="textOnBrand"
            center
            style={{
              marginTop: 18,
              fontFamily: theme.fonts.display800,
              fontSize: 25,
              lineHeight: 30,
              letterSpacing: 0,
              textTransform: 'uppercase',
            }}>
            {t('card.membershipCard')}
          </Text>

          <Text variant="heading" color="textOnBrand" center style={{ marginTop: 6 }}>
            <Text
              variant="heading"
              color="textOnBrandSoft"
              style={{ fontFamily: theme.fonts.text600 }}>
              {`${t('card.nameLabel')}: `}
            </Text>
            {card.memberFullName}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
            }}>
            <View
              style={{
                paddingHorizontal: 22,
                paddingVertical: 6,
                borderRadius: 4,
                backgroundColor: theme.color.surface,
              }}>
              <Text variant="bodyStrong" style={{ fontSize: 18, lineHeight: 24 }}>
                {`${t('card.roleLabel')}: ${t('card.roleMember')}`}
              </Text>
            </View>
            {expired ? <StatusPill label={t('status.expired')} tone="danger" dot /> : null}
          </View>

          <View
            style={{
              marginTop: 18,
              padding: 10,
              borderRadius: 6,
              backgroundColor: '#FFFFFF',
            }}>
            <QRCode
              value={card.cardCode}
              size={132}
              color={theme.color.text}
              backgroundColor="#FFFFFF"
            />
          </View>

          <Text
            variant="heading"
            color="textOnBrand"
            center
            style={{ marginTop: 14, marginBottom: 50 }}>
            <Text
              variant="heading"
              color="textOnBrandSoft"
              style={{ fontFamily: theme.fonts.text600 }}>
              {`${t('card.numberLabel')}: `}
            </Text>
            <Text variant="mono" color="textOnBrand" style={{ fontSize: 18, lineHeight: 24 }}>
              {card.cardCode}
            </Text>
          </Text>
        </View>

        {/* Socials */}
        <View
          style={{
            height: FOOTER_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            paddingLeft: 16,
            // Keep the row clear of the badge sitting over the right corner.
            paddingRight: BADGE + 22,
          }}>
          <SocialTile Icon={GlobeIcon} />
          <SocialTile Icon={FacebookIcon} />
          <SocialTile Icon={TikTokIcon} />
          <SocialTile Icon={XIcon} />
          <Text
            variant="captionStrong"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{ flexShrink: 1, marginLeft: 3, fontSize: 13, textTransform: 'uppercase' }}>
            {SOCIAL_HANDLE}
          </Text>
        </View>

        {/* Plan badge, pinned across the panel's bottom edge */}
        <View
          accessibilityRole="image"
          accessibilityLabel={t('register.planBadge', { plan: card.membershipType })}
          style={{
            position: 'absolute',
            right: 16,
            bottom: FOOTER_HEIGHT - BADGE / 2,
            width: BADGE,
            height: BADGE,
            borderRadius: BADGE / 2,
            padding: 6,
            backgroundColor: theme.color.surface,
          }}>
          {badgeUrl ? (
            <Image source={{ uri: badgeUrl }} style={{ flex: 1 }} contentFit="contain" />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: BADGE / 2,
                backgroundColor: theme.color.accentTint,
              }}>
              <Text
                variant="headline"
                style={{ color: theme.color.accentDeep, fontFamily: theme.fonts.display800 }}>
                {card.membershipType.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function GlobeIcon({ size, color }: { size?: number; color: string }) {
  return <Globe size={size} color={color} strokeWidth={1.8} />;
}

/** Ink glyph on an orange tile: white would fail contrast on orange. */
function SocialTile({ Icon }: { Icon: ComponentType<{ size?: number; color: string }> }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.color.brand,
      }}>
      <Icon size={14} color={theme.color.textOnBrand} />
    </View>
  );
}
