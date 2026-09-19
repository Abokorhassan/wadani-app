import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { ArrowRight, KeyRound, UserPlus, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Rosette, Text, useTheme } from '@/design-system';

const lockup = require('@/assets/brand/lockup-color.png');

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.brand }}>
      <View style={{ position: 'absolute', left: -85, top: -32 }}>
        <Rosette size={560} color={theme.color.text} opacity={0.08} layers={5} waves={16} />
      </View>

      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
        <Image
          source={lockup}
          style={{ width: 204, height: 277 }}
          contentFit="contain"
          accessibilityLabel={t('common.partyName')}
        />
      </View>

      <View
        style={{
          gap: theme.spacing.xl,
          paddingHorizontal: theme.spacing.gutter,
          paddingTop: theme.spacing.xxl,
          paddingBottom: insets.bottom + theme.spacing.xxl,
          borderTopLeftRadius: theme.radius.sheet,
          borderTopRightRadius: theme.radius.sheet,
          backgroundColor: theme.color.background,
        }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="hero">{t('welcome.title')}</Text>
          <Text variant="body" color="textMuted">
            {t('welcome.subtitle')}
          </Text>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <Choice
            icon={UserPlus}
            title={t('welcome.registerTitle')}
            description={t('welcome.registerDescription')}
            href="/register"
            primary
            onPress={() => router.push('/register')}
          />
          <Choice
            icon={KeyRound}
            title={t('welcome.loginTitle')}
            description={t('welcome.loginDescription')}
            href="/login"
            onPress={() => router.push('/login')}
          />
        </View>
      </View>
    </View>
  );
}

function Choice({
  icon: Icon,
  title,
  description,
  primary = false,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: Href;
  primary?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const foreground = primary ? theme.color.textOnAction : theme.color.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.card,
          borderWidth: primary ? 0 : 1,
          borderColor: theme.color.border,
          backgroundColor: primary ? theme.color.action : theme.color.surface,
          opacity: pressed ? 0.9 : 1,
        },
        primary ? theme.shadow.action : null,
      ]}>
      <View
        style={{
          width: 52,
          height: 52,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.lg,
          backgroundColor: primary ? 'rgba(255, 255, 255, 0.16)' : theme.color.brandTint,
        }}>
        <Icon size={24} color={primary ? theme.color.textOnAction : theme.color.brandDeep} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" style={{ fontSize: 17, color: foreground }}>
          {title}
        </Text>
        <Text
          variant="caption"
          style={{ color: primary ? theme.color.textOnAction : theme.color.textMuted }}>
          {description}
        </Text>
      </View>
      <ArrowRight size={22} color={foreground} />
    </Pressable>
  );
}
