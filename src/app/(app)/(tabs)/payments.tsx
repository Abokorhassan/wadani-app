import { Receipt, ShieldCheck } from 'lucide-react-native';
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
  type StatusTone,
} from '@/design-system';
import { useCard } from '@/features/membership';
import {
  groupByYear,
  paymentMethodIcon,
  paymentMethodLabel,
  paymentMethodTone,
  usePayments,
  type Payment,
  type PaymentStatus,
} from '@/features/payments';
import { formatDate, formatMonthYear, formatUsd } from '@/lib/format';

const STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
  unknown: 'neutral',
};

export default function PaymentsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const card = useCard();
  const payments = usePayments();

  const refresh = () => {
    void card.refetch();
    void payments.refetch();
  };

  return (
    <Screen
      withTabBar
      refreshControl={
        <RefreshControl
          refreshing={payments.isRefetching}
          onRefresh={refresh}
          tintColor={theme.color.brand}
        />
      }>
      <ScreenHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />

      {card.data ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 22,
            paddingVertical: 18,
            paddingLeft: 20,
            paddingRight: 18,
            borderRadius: theme.radius.card,
            backgroundColor: theme.color.surfaceWarm,
          }}>
          <View style={{ gap: 4 }}>
            <Text variant="overline" color="accentDeep">
              {t('payments.validUntil')}
            </Text>
            <Text variant="display">{formatMonthYear(card.data.validUntil)}</Text>
            <Text
              variant="caption"
              color="textSecondary"
              style={{ fontFamily: theme.fonts.text600 }}>
              {t('payments.planMembership', { plan: card.data.membershipType })}
            </Text>
          </View>
          <IconTile icon={ShieldCheck} tone="surface" size={52} round />
        </View>
      ) : null}

      <View style={{ marginTop: 26, gap: 12 }}>
        {payments.isPending ? (
          [0, 1].map((key) => <Skeleton key={key} height={92} radius={theme.radius.card} />)
        ) : payments.isError ? (
          <ErrorState
            message={t('payments.loadFailed')}
            onRetry={() => void payments.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : payments.data.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={t('payments.emptyTitle')}
            message={t('payments.emptyText')}
          />
        ) : (
          groupByYear(payments.data).map((group, index) => (
            <View key={group.year} style={{ gap: 12, marginTop: index === 0 ? 0 : 10 }}>
              <Text variant="overline" color="textMuted">
                {group.year}
              </Text>
              {group.payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const label = paymentMethodLabel(payment.method);

  return (
    <View
      accessible
      accessibilityLabel={`${label}, ${formatUsd(payment.amountUsd)}, ${t(`status.${payment.status}`)}, ${formatDate(payment.date)}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingLeft: 14,
        paddingRight: 16,
        borderRadius: theme.radius.card,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.surface,
      }}>
      <IconTile
        icon={paymentMethodIcon(payment.method)}
        tone={paymentMethodTone(payment.method)}
        size={46}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{label}</Text>
        <Text variant="caption" color="textMuted">
          {formatDate(payment.date)}
        </Text>
        <Text variant="monoSmall" color="textMuted">
          {payment.reference}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <Text variant="heading">{formatUsd(payment.amountUsd)}</Text>
        <StatusPill label={t(`status.${payment.status}`)} tone={STATUS_TONE[payment.status]} />
      </View>
    </View>
  );
}
