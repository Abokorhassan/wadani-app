import { Bell, Hourglass, Receipt, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  IconTile,
  Screen,
  ScreenHeader,
  Skeleton,
  StatusPill,
  Text,
  useTheme,
  type IconTileTone,
} from '@/design-system';
import {
  useNotifications,
  type Notification,
  type NotificationType,
} from '@/features/notifications';
import { formatDayMonth } from '@/lib/format';

const TYPE_STYLE: Record<NotificationType, { icon: LucideIcon; tone: IconTileTone }> = {
  approved: { icon: ShieldCheck, tone: 'success' },
  payment: { icon: Receipt, tone: 'brand' },
  review: { icon: Hourglass, tone: 'warning' },
  other: { icon: Bell, tone: 'neutral' },
};

export default function CommunicationsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const notifications = useNotifications();

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
      />

      <View style={{ marginTop: 22, gap: 12 }}>
        {notifications.isPending ? (
          [0, 1, 2].map((key) => <Skeleton key={key} height={118} radius={theme.radius.card} />)
        ) : notifications.isError ? (
          <ErrorState
            message={t('communications.loadFailed')}
            onRetry={() => void notifications.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : notifications.data.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t('communications.emptyTitle')}
            message={t('communications.emptyText')}
          />
        ) : (
          notifications.data.map((item) => <NotificationRow key={item.id} item={item} />)
        )}
      </View>
    </Screen>
  );
}

function NotificationRow({ item }: { item: Notification }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const style = TYPE_STYLE[item.type];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        padding: 16,
        borderRadius: theme.radius.card,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.surface,
      }}>
      <IconTile icon={style.icon} tone={style.tone} />
      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
          }}>
          <Text variant="bodyStrong" style={{ flexShrink: 1 }}>
            {item.title}
          </Text>
          <Text variant="captionStrong" color="textMuted">
            {formatDayMonth(item.sentAt)}
          </Text>
        </View>
        <Text variant="small" color="textSecondary" style={{ fontFamily: theme.fonts.text400 }}>
          {item.body}
        </Text>
        {item.channels.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
            {item.channels.map((channel) => (
              <StatusPill key={channel} label={t(`communications.channels.${channel}`)} />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
