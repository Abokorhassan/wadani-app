import { Image } from 'expo-image';
import type { Ref } from 'react';
import { View } from 'react-native';

import { Text, useTheme, WhatsAppIcon, lightTheme, ThemeProvider } from '@/design-system';
import { env } from '@/lib/env';
import { formatPhoneForDisplay } from '@/lib/phone';

import { useCardTranslation } from '../card-language';

// The party's gold Membership Office seal (2026-11-25), cut out of its white background.
const membershipStamp = require('@/assets/brand/membership-stamp.png');
const sealColor = require('@/assets/brand/seal-color.png');
const wordmarkBlack = require('@/assets/brand/wordmark-black.png');

export interface MembershipCardBackProps {
  ref?: Ref<View>;
  /** The member's own WhatsApp, or their phone when they gave none. */
  memberWhatsApp?: string;
}

/** The reverse of the printed membership card: ownership notice + return instructions. */
/**
 * The card is a printed card: it looks the same in light and dark mode, and is
 * saved and shared as it is printed. So it always draws with the light theme.
 */
export function MembershipCardBack(props: MembershipCardBackProps) {
  return (
    <ThemeProvider value={lightTheme}>
      <MembershipCardBackFace {...props} />
    </ThemeProvider>
  );
}

function MembershipCardBackFace({ ref, memberWhatsApp }: MembershipCardBackProps) {
  const theme = useTheme();
  const t = useCardTranslation();

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

        {/*
          One WhatsApp panel for both numbers, each saying whose it is. The
          party's customer care comes first, because the sentence above leads
          into it; then the card holder's, so a finder can reach them too.
        */}
        <View
          style={{
            marginTop: 22,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.background,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 10,
            }}>
            <WhatsAppIcon size={20} color={theme.color.whatsapp} />
            <Text
              variant="captionStrong"
              style={{ letterSpacing: 1, textTransform: 'uppercase', color: theme.color.text }}>
              WhatsApp
            </Text>
          </View>
          <ContactRow label={t('cardBack.customerCare')} number={env.partyWhatsApp} />
          {memberWhatsApp ? (
            <ContactRow label={t('cardBack.member')} number={memberWhatsApp} />
          ) : null}
        </View>

        {/* Membership Office seal, bottom-right */}
        <View style={{ flex: 1, minHeight: 12 }} />
        <View style={{ alignItems: 'flex-end' }}>
          <Image
            source={membershipStamp}
            style={{ width: 132, height: 132 }}
            contentFit="contain"
            accessibilityLabel={t('cardBack.stampLabel')}
          />
        </View>
      </View>
    </View>
  );
}

/** One number in the WhatsApp panel: whose it is, then the number itself. */
function ContactRow({ label, number }: { label: string; number: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        gap: 2,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: theme.color.border,
      }}>
      <Text variant="captionStrong" style={{ color: theme.color.textMuted }}>
        {label}
      </Text>
      <Text
        variant="heading"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={{ fontSize: 20, color: theme.color.text }}>
        {formatPhoneForDisplay(number)}
      </Text>
    </View>
  );
}
