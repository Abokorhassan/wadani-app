import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text, useTheme, WhatsAppIcon } from '@/design-system';

import { useContactInfo } from '../hooks';
import { openWhatsApp } from '../links';

/**
 * "Questions? Chat on WhatsApp", for the screens a visitor sees before they have
 * an account, so someone unsure about joining can reach the office directly.
 */
export function WhatsAppLink({ message }: { message: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const contact = useContactInfo();
  if (!contact.data) return null;
  const number = contact.data.whatsappNumber;

  return (
    <Pressable
      onPress={() => void openWhatsApp(number, message)}
      accessibilityRole="link"
      accessibilityLabel={t('welcome.whatsappLabel')}
      hitSlop={8}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        minHeight: theme.hitSize,
        opacity: pressed ? 0.6 : 1,
      })}>
      <View
        style={{
          width: 28,
          height: 28,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          backgroundColor: theme.color.whatsapp,
        }}>
        <WhatsAppIcon size={16} color="#FFFFFF" />
      </View>
      <Text variant="small" color="textMuted">
        {t('welcome.whatsappQuestion')}{' '}
        <Text variant="smallStrong" color="actionDeep">
          {t('welcome.whatsappCta')}
        </Text>
      </Text>
    </Pressable>
  );
}
