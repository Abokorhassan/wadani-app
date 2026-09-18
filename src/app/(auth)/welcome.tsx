import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight, KeyRound, UserPlus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Screen, Text, useTheme } from '@/design-system';

const lockup = require('@/assets/brand/lockup-color.png');

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const choices = [
    {
      icon: UserPlus,
      title: t('welcome.registerTitle'),
      description: t('welcome.registerDescription'),
      onPress: () => router.push('/register'),
    },
    {
      icon: KeyRound,
      title: t('welcome.loginTitle'),
      description: t('welcome.loginDescription'),
      onPress: () => router.push('/login'),
    },
  ];

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: theme.spacing.xxl }}>
        <Image
          source={lockup}
          style={{ width: 180, height: 244 }}
          contentFit="contain"
          accessibilityLabel={t('common.partyName')}
        />
      </View>

      <Text variant="title" center>
        {t('welcome.title')}
      </Text>
      <Text variant="small" color="textMuted" center style={{ marginTop: theme.spacing.xs }}>
        {t('welcome.subtitle')}
      </Text>

      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
        {choices.map(({ icon: Icon, title, description, onPress }) => (
          <Card key={title} onPress={onPress} accessibilityLabel={title}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.color.brandTint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon size={22} color={theme.color.brandDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{title}</Text>
                <Text variant="caption" color="textMuted">
                  {description}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.color.textMuted} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
