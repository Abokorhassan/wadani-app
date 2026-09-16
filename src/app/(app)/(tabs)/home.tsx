import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Screen, Text, useTheme } from '@/design-system';
import { useSessionStore } from '@/features/auth/session-store';
import { firstName } from '@/lib/format';

const seal = require('@/assets/brand/seal-color.png');

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const member = useSessionStore((state) => state.member);

  return (
    <Screen padded={false}>
      {/* Brand header: orange surface, dark text (white would fail contrast). */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          backgroundColor: theme.color.brand,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.lg,
          borderBottomLeftRadius: theme.radius.xl,
          borderBottomRightRadius: theme.radius.xl,
        }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.color.surface,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}>
          <Image source={seal} style={{ width: '100%', height: '100%' }} contentFit="contain" />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="smallStrong" color="textOnBrand">
            {t('common.partyName').toUpperCase()}
          </Text>
          <Text variant="caption" color="textOnBrand" style={{ opacity: 0.8 }}>
            {t('common.partyTagline')} · Membership
          </Text>
        </View>
      </View>

      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View>
          <Text variant="title">Hi, {firstName(member?.fullName ?? 'Member')}</Text>
          <Text variant="small" color="textMuted" style={{ marginTop: theme.spacing.xs }}>
            Welcome back to your Waddani membership.
          </Text>
        </View>

        <Card tone="brandTint">
          <Text variant="bodyStrong">Phase 0 shell</Text>
          <Text variant="small" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
            Navigation, theming and the API layer are in place. Home, the card, payments and the
            profile are built in Phase 2.
          </Text>
        </Card>

        <Button
          label="Open component gallery"
          variant="secondary"
          onPress={() => router.push('/gallery')}
        />
      </View>
    </Screen>
  );
}
