import { Check, Crown, IdCard, Star, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Controller, type Control, type UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ErrorState, Rosette, SegmentedTabs, Skeleton, Text, useTheme } from '@/design-system';
import {
  priceFor,
  usePeriods,
  usePlans,
  type MembershipPeriod,
  type Plan,
} from '@/features/membership';
import { formatUsd } from '@/lib/format';

import type { RegistrationForm } from '../form';

/** Plan ids are uuids, so the backend's `stars` rank picks the icon. */
const PLAN_ICONS: readonly LucideIcon[] = [IdCard, Star, Crown];

const planIconRank = (stars?: number): number => (!stars || stars <= 1 ? 0 : stars >= 3 ? 2 : 1);

export interface PlanStepProps {
  control: Control<RegistrationForm>;
  planId: string;
  periodId: string;
  setValue: UseFormSetValue<RegistrationForm>;
}

export function PlanStep({ control, planId, periodId, setValue }: PlanStepProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const plans = usePlans();
  const periods = usePeriods();

  /*
   * Preselect the first plan and period, and repair a choice the backend no
   * longer offers. A saved draft keeps the id it was written with, so a plan
   * retired since then would otherwise leave the step with no plan, no price
   * and no way out (build-plan D12).
   */
  useEffect(() => {
    const list = plans.data;
    if (!list?.length) return;
    if (!planId || !list.some((option) => option.id === planId)) setValue('planId', list[0].id);
  }, [planId, plans.data, setValue]);

  useEffect(() => {
    const list = periods.data;
    if (!list?.length) return;
    if (!periodId || !list.some((option) => option.id === periodId))
      setValue('periodId', list[0].id);
  }, [periodId, periods.data, setValue]);

  const plan = plans.data?.find((candidate) => candidate.id === planId);
  const period = periods.data?.find((candidate) => candidate.id === periodId);

  return (
    <View style={{ gap: theme.spacing.gutter }}>
      {/* The party currently offers one plan, and a one-option picker is noise. */}
      <View style={{ gap: 10, display: plans.data?.length === 1 ? 'none' : 'flex' }}>
        <Text variant="label" color="textSecondary">
          {t('register.plan')}
        </Text>
        {plans.isPending ? (
          <Skeleton height={52} radius={theme.radius.pill} />
        ) : plans.isError || !plans.data ? (
          <ErrorState
            message={t('register.plansFailed')}
            onRetry={() => void plans.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : (
          <Controller
            control={control}
            name="planId"
            render={({ field }) => (
              <SegmentedTabs
                value={field.value}
                onChange={field.onChange}
                items={plans.data.map((option) => ({
                  key: option.id,
                  label: option.name,
                  icon: PLAN_ICONS[planIconRank(option.stars)],
                }))}
              />
            )}
          />
        )}
      </View>

      {plan ? (
        <PlanCard plan={plan} />
      ) : plans.isPending ? (
        <Skeleton height={330} radius={theme.radius.hero} />
      ) : null}

      <View style={{ gap: 10 }}>
        <Text variant="label" color="textSecondary">
          {t('register.period')}
        </Text>
        {periods.isPending ? (
          <Skeleton height={74} radius={theme.radius.card} />
        ) : periods.isError || !periods.data ? (
          <ErrorState
            message={t('register.periodsFailed')}
            onRetry={() => void periods.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : (
          <Controller
            control={control}
            name="periodId"
            render={({ field, fieldState }) => (
              <View style={{ gap: theme.spacing.sm }}>
                <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                  {periods.data.map((option) => (
                    <PeriodOption
                      key={option.id}
                      period={option}
                      plan={plan}
                      selected={option.id === field.value}
                      onSelect={() => field.onChange(option.id)}
                    />
                  ))}
                </View>
                {fieldState.error ? (
                  <Text
                    variant="caption"
                    color="danger"
                    style={{ fontFamily: theme.fonts.text600 }}>
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>

      {plan && period ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 18,
            borderRadius: theme.radius.card,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.surface,
          }}>
          <Text variant="smallStrong" color="textSecondary" style={{ fontSize: 15 }}>
            {t('register.total')}
          </Text>
          <Text variant="display" style={{ fontSize: 26, lineHeight: 30 }}>
            {formatUsd(priceFor(plan, period))}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const Icon = PLAN_ICONS[planIconRank(plan.stars)];

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          gap: theme.spacing.gutter,
          padding: 22,
          paddingVertical: 24,
          borderRadius: 28,
          backgroundColor: theme.color.surfaceInk,
        },
        theme.shadow.ink,
      ]}>
      <View style={{ position: 'absolute', right: -175, top: -175 }}>
        <Rosette size={320} color={theme.color.brand} opacity={0.2} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius.pill,
            backgroundColor: theme.color.brand,
          }}>
          <Icon size={20} color={theme.color.textOnBrand} />
        </View>
        <Text variant="display" color="textOnInk">
          {plan.name}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text variant="amount" color="brand" style={{ fontSize: 54, lineHeight: 56 }}>
          ${plan.priceUsd}
        </Text>
        <Text variant="bodyMedium" color="textOnInkSoft">
          {t('register.perYear')}
        </Text>
      </View>

      {/*
        The live plan carries no benefit lines at all, so the divider and the
        heading would frame an empty space. Both only appear when there is
        something to list.
      */}
      {plan.benefits.length > 0 ? (
        <>
          <View style={{ height: 1, backgroundColor: 'rgba(255, 239, 219, 0.12)' }} />
          <View style={{ gap: 14 }}>
            <Text variant="overline" color="textOnInkFaint">
              {t('register.topBenefits')}
            </Text>
            {plan.benefits.map((benefit) => (
              <View
                key={benefit}
                style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: theme.color.brand,
                  }}>
                  <Check size={14} color={theme.color.textOnBrand} strokeWidth={3} />
                </View>
                <Text variant="small" color="textOnInk" style={{ flex: 1, fontSize: 15 }}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function PeriodOption({
  period,
  plan,
  selected,
  onSelect,
}: {
  period: MembershipPeriod;
  plan?: Plan;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={period.label}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: 16,
        borderRadius: theme.radius.card,
        borderWidth: selected ? 2 : 1.5,
        borderColor: selected ? theme.color.action : theme.color.borderStrong,
        backgroundColor: selected ? theme.color.actionTint : theme.color.surface,
      }}>
      <View style={{ gap: 2 }}>
        <Text variant="bodyStrong">{period.label}</Text>
        {plan ? (
          <Text
            variant="small"
            color={selected ? 'actionDeep' : 'textMuted'}
            style={{ fontFamily: theme.fonts.text600 }}>
            {formatUsd(priceFor(plan, period))}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 24,
          height: 24,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          borderWidth: selected ? 0 : 2,
          borderColor: theme.color.borderStrong,
          backgroundColor: selected ? theme.color.action : 'transparent',
        }}>
        {selected ? <Check size={14} color={theme.color.textOnAction} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}
