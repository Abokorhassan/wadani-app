import { Image } from 'expo-image';
import { Calendar, Clock, MapPin, Newspaper } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  Rosette,
  Screen,
  ScreenHeader,
  SegmentedTabs,
  Skeleton,
  Text,
  useTheme,
} from '@/design-system';
import { useEvents, useNews, type NewsItem, type PartyEvent } from '@/features/news-events';
import { formatDate, formatTime } from '@/lib/format';

const sealBlack = require('@/assets/brand/seal-black.png');

type Tab = 'news' | 'events';

export default function NewsEventsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('news');
  const news = useNews();
  const events = useEvents();
  const active = tab === 'news' ? news : events;

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={active.isRefetching}
          onRefresh={() => void active.refetch()}
          tintColor={theme.color.brand}
        />
      }>
      <ScreenHeader back title={t('news.title')} subtitle={t('news.subtitle')} />

      <View style={{ marginTop: theme.spacing.gutter }}>
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'news', label: t('news.tabNews'), icon: Newspaper },
            { key: 'events', label: t('news.tabEvents'), icon: Calendar },
          ]}
        />
      </View>

      <View style={{ marginTop: theme.spacing.gutter, gap: 12 }}>
        {active.isPending ? (
          [0, 1, 2].map((key) => <Skeleton key={key} height={150} radius={theme.radius.card} />)
        ) : active.isError ? (
          <ErrorState
            message={tab === 'news' ? t('news.newsFailed') : t('news.eventsFailed')}
            onRetry={() => void active.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : tab === 'news' ? (
          news.data && news.data.length > 0 ? (
            news.data.map((item, index) => (
              <NewsCard key={item.id} item={item} featured={index === 0} />
            ))
          ) : (
            <EmptyState
              icon={Newspaper}
              title={t('news.emptyNewsTitle')}
              message={t('news.emptyNewsText')}
            />
          )
        ) : events.data && events.data.length > 0 ? (
          events.data.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <EmptyState
            icon={Calendar}
            title={t('news.emptyEventsTitle')}
            message={t('news.emptyEventsText')}
          />
        )}
      </View>
    </Screen>
  );
}

function NewsCard({ item, featured }: { item: NewsItem; featured: boolean }) {
  const theme = useTheme();

  return (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: theme.radius.hero,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.surface,
      }}>
      {featured ? (
        <View style={{ height: 148, overflow: 'hidden', backgroundColor: theme.color.brand }}>
          <View style={{ position: 'absolute', right: -120, top: -140 }}>
            <Rosette size={360} color={theme.color.text} opacity={0.14} />
          </View>
          <Image
            source={sealBlack}
            style={{ position: 'absolute', left: 18, bottom: 16, width: 56, height: 56 }}
          />
        </View>
      ) : null}
      <View style={{ gap: 8, padding: 18 }}>
        <Text variant="overline" color="accentDeep">
          {formatDate(item.publishedAt)}
        </Text>
        <Text variant={featured ? 'headline' : 'heading'}>{item.title}</Text>
        <Text variant="subtitle" color="textSecondary">
          {item.body}
        </Text>
      </View>
    </View>
  );
}

function EventCard({ event }: { event: PartyEvent }) {
  const theme = useTheme();
  const date = new Date(event.startsAt);

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 14,
        padding: 14,
        borderRadius: theme.radius.card,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.surface,
      }}>
      <View
        style={{
          width: 64,
          height: 76,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          borderRadius: theme.radius.button,
          backgroundColor: theme.color.brandTint,
        }}>
        <Text variant="overline" color="accentDeep">
          {date.toLocaleDateString('en', { month: 'short' })}
        </Text>
        <Text variant="display" style={{ fontSize: 30, lineHeight: 32 }}>
          {date.getDate()}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <Text variant="bodyStrong">{event.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Clock size={15} color={theme.color.textMuted} />
          <Text variant="caption" color="textMuted">
            {formatTime(event.startsAt)}
          </Text>
        </View>
        {event.venue ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MapPin size={15} color={theme.color.textMuted} />
            <Text variant="caption" color="textMuted">
              {event.venue}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
