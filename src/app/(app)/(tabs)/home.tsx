import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import {
  Bell,
  Heart,
  IdCard,
  MessageCircle,
  Newspaper,
  Receipt,
  Share2,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, Share, View } from 'react-native';

import {
  Button,
  ErrorState,
  IconButton,
  IconTile,
  Rosette,
  Screen,
  Skeleton,
  Text,
  useTheme,
  type IconTileTone,
} from '@/design-system';
import { MiniCard, useCard, useMe } from '@/features/membership';
import { env } from '@/lib/env';
import { firstName } from '@/lib/format';

const sealBlack = require('@/assets/brand/seal-black.png');

interface Tile {
  icon: LucideIcon;
  tone: IconTileTone;
  title: string;
  text: string;
  href: Href;
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const me = useMe();
  const card = useCard();

  const name = me?.fullName ?? card.data?.memberFullName ?? '';

  const tiles: Tile[] = [
    {
      icon: IdCard,
      tone: 'brand',
      title: t('home.tiles.card'),
      text: t('home.tiles.cardText'),
      href: '/card',
    },
    {
      icon: Receipt,
      tone: 'action',
      title: t('home.tiles.payments'),
      text: t('home.tiles.paymentsText'),
      href: '/payments',
    },
    {
      icon: Heart,
      tone: 'accent',
      title: t('home.tiles.donate'),
      text: t('home.tiles.donateText'),
      href: '/donate',
    },
    {
      icon: Newspaper,
      tone: 'brand',
      title: t('home.tiles.news'),
      text: t('home.tiles.newsText'),
      href: '/news-events',
    },
    {
      icon: Users,
      tone: 'action',
      title: t('home.tiles.family'),
      text: t('home.tiles.familyText'),
      href: '/family',
    },
    {
      icon: MessageCircle,
      tone: 'accent',
      title: t('home.tiles.contact'),
      text: t('home.tiles.contactText'),
      href: '/contact',
    },
  ];

  const invite = () =>
    void Share.share({
      message: [t('home.inviteMessage'), env.inviteUrl].filter(Boolean).join(' '),
    });

  return (
    <Screen
      withTabBar
      refreshControl={
        <RefreshControl
          refreshing={card.isRefetching}
          onRefresh={() => void card.refetch()}
          tintColor={theme.color.brand}
        />
      }>
      {/* Brand strip */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: theme.spacing.md,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image
            source={sealBlack}
            style={{ width: 40, height: 40 }}
            accessibilityLabel={t('common.partyName')}
          />
          <View style={{ gap: 1 }}>
            <Text variant="brand">{t('common.partyNameCaps')}</Text>
            <Text variant="captionStrong" color="textMuted">
              {t('common.partyTagline')}
            </Text>
          </View>
        </View>
        <IconButton
          icon={Bell}
          badge
          accessibilityLabel={t('home.notifications')}
          onPress={() => router.push('/communications')}
        />
      </View>

      <View style={{ marginTop: 26, gap: 6 }}>
        <Text variant="title" style={{ fontSize: 36, lineHeight: 40, letterSpacing: -0.72 }}>
          {t('home.greeting', { name: firstName(name) })}
        </Text>
        <Text variant="subtitle" color="textMuted">
          {t('home.subtitle')}
        </Text>
      </View>

      <View style={{ marginTop: 22 }}>
        {card.data ? (
          <MiniCard card={card.data} onPress={() => router.push('/card')} />
        ) : card.isError ? (
          <ErrorState
            message={t('card.loadFailed')}
            onRetry={() => void card.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : (
          <Skeleton height={204} radius={theme.radius.hero} />
        )}
      </View>

      {/* Invite */}
      <View
        style={{
          marginTop: 14,
          overflow: 'hidden',
          alignItems: 'flex-start',
          gap: 14,
          padding: 18,
          borderRadius: theme.radius.card,
          backgroundColor: theme.color.surfaceInk,
        }}>
        <View style={{ position: 'absolute', right: -120, bottom: -150 }}>
          <Rosette size={280} color={theme.color.brand} opacity={0.22} layers={3} waves={12} />
        </View>
        <View style={{ gap: 4, paddingRight: 40 }}>
          <Text variant="heading" color="textOnInk">
            {t('home.inviteTitle')}
          </Text>
          <Text variant="small" color="textOnInkSoft">
            {t('home.inviteText')}
          </Text>
        </View>
        <Button
          label={t('home.invite')}
          icon={Share2}
          variant="brand"
          size="sm"
          block={false}
          onPress={invite}
        />
      </View>

      {/* Tiles */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.title}
            onPress={() => router.push(tile.href)}
            accessibilityRole="button"
            accessibilityLabel={tile.title}
            style={({ pressed }) => ({
              flexBasis: '46%',
              flexGrow: 1,
              gap: 14,
              paddingVertical: 16,
              paddingHorizontal: 14,
              borderRadius: theme.radius.card,
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: pressed ? theme.color.surfaceSunken : theme.color.surface,
            })}>
            <IconTile icon={tile.icon} tone={tile.tone} />
            <View style={{ gap: 2 }}>
              <Text variant="smallStrong">{tile.title}</Text>
              <Text variant="caption" color="textMuted">
                {tile.text}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
