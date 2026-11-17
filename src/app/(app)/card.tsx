import { Download, RefreshCw, Share2 } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { Button, ErrorState, Screen, ScreenHeader, Skeleton, useTheme } from '@/design-system';
import {
  MembershipCard,
  MembershipCardBack,
  useCard,
  useCardActions,
  useOnFreePlan,
  usePlanBadge,
} from '@/features/membership';

export default function CardScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const card = useCard();
  const badgeUrl = usePlanBadge(card.data?.membershipType);
  const free = useOnFreePlan(card.data?.membershipType);
  const cardRef = useRef<View>(null);
  const { save, share, busy } = useCardActions(cardRef);
  const [showBack, setShowBack] = useState(false);

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={card.isRefetching}
          onRefresh={() => void card.refetch()}
          tintColor={theme.color.brand}
        />
      }>
      <ScreenHeader back title={t('card.title')} subtitle={t('card.subtitle')} />

      <View style={{ marginTop: 22 }}>
        {card.data ? (
          showBack ? (
            <MembershipCardBack ref={cardRef} />
          ) : (
            <MembershipCard ref={cardRef} card={card.data} badgeUrl={badgeUrl} showBadge={!free} />
          )
        ) : card.isError ? (
          <ErrorState
            message={t('card.loadFailed')}
            onRetry={() => void card.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : (
          <Skeleton height={740} radius={30} />
        )}
      </View>

      {card.data ? (
        <View style={{ gap: 12, marginTop: 20 }}>
          <Button
            label={showBack ? t('card.flipToFront') : t('card.flipToBack')}
            icon={RefreshCw}
            variant="secondary"
            onPress={() => setShowBack((prev) => !prev)}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
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
        </View>
      ) : null}
    </Screen>
  );
}
