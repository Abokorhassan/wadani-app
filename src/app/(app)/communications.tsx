import { useRouter } from 'expo-router';
import {
  Bell,
  CalendarDays,
  Heart,
  Newspaper,
  Receipt,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  IconTile,
  Screen,
  ScreenHeader,
  Skeleton,
  Text,
  useTheme,
  type IconTileTone,
} from '@/design-system';
import {
  notificationDestination,
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  type Notification,
  type NotificationType,
} from '@/features/notifications';
import { formatDayMonth } from '@/lib/format';

const TYPE_STYLE: Record<NotificationType, { icon: LucideIcon; tone: IconTileTone }> = {
  news: { icon: Newspaper, tone: 'brand' },
  event: { icon: CalendarDays, tone: 'accent' },
  payment: { icon: Receipt, tone: 'action' },
  donation: { icon: Heart, tone: 'warning' },
  other: { icon: Bell, tone: 'neutral' },
};

export default function CommunicationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const notifications = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const unread = notifications.data?.unreadCount ?? 0;

  /** Reading it marks it read; then it opens what it is about. */
  const open = (item: Notification) => {
    if (!item.read) markRead.mutate(item.id);
    const destination = notificationDestination(item.type);
    if (destination === 'payments') router.push('/payments');
    else if (destination) {
      router.push({
        pathname: '/news-events',
        // `at` makes each notification a new link, so the tab switches every time.
        params: { tab: destination, at: item.id },
      });
    }
  };

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={notifications.isRefetching}
          onRefresh={() => void notifications.refetch()}
          tintColor={theme.color.brand}
        />
      }>
      <ScreenHeader
        back
        title={t('communications.title')}
        subtitle={t('communications.subtitle')}
        action={
          unread > 0 ? (
            <Text
              variant="smallStrong"
              color="actionDeep"
              accessibilityRole="button"
              onPress={() => markAllRead.mutate()}
              style={{ paddingVertical: 10 }}>
              {t('communications.markAllRead')}
            </Text>
          ) : undefined
        }
      />

      <View style={{ marginTop: 22, gap: 12 }}>
        {notifications.isPending ? (
          [0, 1, 2].map((key) => <Skeleton key={key} height={104} radius={theme.radius.card} />)
        ) : notifications.isError ? (
          <ErrorState
            message={t('communications.loadFailed')}
            onRetry={() => void notifications.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : notifications.data.notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t('communications.emptyTitle')}
            message={t('communications.emptyText')}
          />
        ) : (
          notifications.data.notifications.map((item) => (
            <NotificationRow key={item.id} item={item} onPress={() => open(item)} />
          ))
        )}
      </View>
    </Screen>
  );
}

function NotificationRow({ item, onPress }: { item: Notification; onPress: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const style = TYPE_STYLE[item.type];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.read ? '' : `${t('communications.unread')}, `}${item.title}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        padding: 16,
        borderRadius: theme.radius.card,
        borderWidth: 1,
        // Unread ones stand out until opened.
        borderColor: item.read ? theme.color.border : theme.color.brand,
        backgroundColor: theme.color.surface,
        opacity: pressed ? 0.7 : 1,
      })}>
      <IconTile icon={style.icon} tone={style.tone} />
      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
          }}>
          <Text
            variant="bodyStrong"
            style={{ flexShrink: 1, fontFamily: item.read ? theme.fonts.text600 : undefined }}>
            {item.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {item.read ? null : (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.color.brand,
                }}
              />
            )}
            <Text variant="captionStrong" color="textMuted">
              {formatDayMonth(item.createdAt)}
            </Text>
          </View>
        </View>
        <Text
          variant="small"
          color="textSecondary"
          numberOfLines={3}
          style={{ fontFamily: theme.fonts.text400 }}>
          {item.body}
        </Text>
      </View>
    </Pressable>
  );
}
