import { Download, Share2 } from 'lucide-react-native';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { Button, ErrorState, Screen, ScreenHeader, Skeleton, useTheme } from '@/design-system';
import { MembershipCard, useCard, useCardActions } from '@/features/membership';

export default function CardScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const card = useCard();
  const cardRef = useRef<View>(null);
  const { save, share, busy } = useCardActions(cardRef);

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
      <ScreenHeader title={t('card.title')} subtitle={t('card.subtitle')} />

      <View style={{ marginTop: 22 }}>
        {card.data ? (
          <MembershipCard ref={cardRef} card={card.data} />
        ) : card.isError ? (
          <ErrorState
            message={t('card.loadFailed')}
            onRetry={() => void card.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : (
          <Skeleton height={680} radius={30} />
        )}
      </View>

      {card.data ? (
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <Button
            label={t('card.save')}
            icon={Download}
            variant="secondary"
            loading={busy === 'save'}
            onPress={() => void save()}
            style={{ flex: 1 }}
          />
          <Button
            label={t('card.share')}
            icon={Share2}
            variant="secondary"
            loading={busy === 'share'}
            onPress={() => void share()}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
    </Screen>
  );
}
