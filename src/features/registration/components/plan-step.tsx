import { Image } from 'expo-image';
import { Check, Crown, IdCard, Star, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Controller, type Control, type UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { ErrorState, Rosette, Skeleton, Text, TextField, useTheme } from '@/design-system';
import { membershipTotal, usePlans, type Plan } from '@/features/membership';
import { formatUsd } from '@/lib/format';

import { MAX_MONTHS, MIN_MONTHS, monthsOf, type RegistrationForm } from '../form';

/** Plan ids are uuids, so the backend's `stars` rank picks the icon. */
const PLAN_ICONS: readonly LucideIcon[] = [IdCard, Star, Crown];

const planIconRank = (stars?: number): number => (!stars || stars <= 1 ? 0 : stars >= 3 ? 2 : 1);

/** One tap for the lengths most members pick; any other can be typed. */
const QUICK_MONTHS = [1, 6, 12, 24] as const;

export interface PlanStepProps {
  control: Control<RegistrationForm>;
  planId: string;
  months: string;
  setValue: UseFormSetValue<RegistrationForm>;
}

export function PlanStep({ control, planId, months, setValue }: PlanStepProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const plans = usePlans();

  /*
   * Preselect the first plan, and repair a choice the backend no longer offers.
   * A saved draft keeps the id it was written with, so a plan retired since then
   * would otherwise leave the step with no plan, no price and no way out
   * (build-plan D12).
   */
  useEffect(() => {
    const list = plans.data;
    if (!list?.length) return;
    if (!planId || !list.some((option) => option.id === planId)) setValue('planId', list[0].id);
  }, [planId, plans.data, setValue]);

  const plan = plans.data?.find((candidate) => candidate.id === planId);
  const count = monthsOf(months);
  const validCount = count !== null && count >= MIN_MONTHS && count <= MAX_MONTHS ? count : null;

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
            render={({ field, fieldState }) => (
              <View style={{ gap: theme.spacing.sm }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: theme.spacing.sm, paddingRight: theme.spacing.sm }}>
                  {plans.data.map((option) => (
                    <PlanChip
                      key={option.id}
                      label={option.name}
                      icon={PLAN_ICONS[planIconRank(option.stars)]}
                      selected={option.id === field.value}
                      onSelect={() => field.onChange(option.id)}
                    />
                  ))}
                </ScrollView>
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

      {plan ? (
        <PlanCard plan={plan} />
      ) : plans.isPending ? (
        <Skeleton height={330} radius={theme.radius.hero} />
      ) : null}

      <Controller
        control={control}
        name="months"
        render={({ field, fieldState }) => (
          <View style={{ gap: theme.spacing.md }}>
            <TextField
              label={t('register.months')}
              value={field.value}
              onChangeText={(text) => field.onChange(text.replace(/[^\d]/g, ''))}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              hint={t('register.monthsHint', { min: MIN_MONTHS, max: MAX_MONTHS })}
              keyboardType="number-pad"
              maxLength={2}
              trailing={
                <Text variant="bodyMedium" color="textMuted">
                  {t('register.monthsWord', { count: monthsOf(field.value) ?? 0 })}
                </Text>
              }
            />
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {QUICK_MONTHS.map((option) => (
                <MonthsChip
                  key={option}
                  label={t('register.monthsUnit', { count: option })}
                  selected={monthsOf(field.value) === option}
                  onSelect={() => field.onChange(String(option))}
                />
              ))}
            </View>
          </View>
        )}
      />

      {plan ? (
        <View
          style={{
            gap: 4,
            padding: 18,
            borderRadius: theme.radius.card,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.surface,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text variant="smallStrong" color="textSecondary" style={{ fontSize: 15 }}>
              {t('register.total')}
            </Text>
            <Text variant="display" style={{ fontSize: 26, lineHeight: 30 }}>
              {validCount === null ? '—' : formatUsd(membershipTotal(plan, validCount))}
            </Text>
          </View>
          {validCount !== null ? (
            <Text variant="caption" color="textMuted" style={{ textAlign: 'right' }}>
              {t('register.totalFormula', {
                price: formatUsd(plan.priceUsd),
                months: t('register.monthsUnit', { count: validCount }),
              })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function PlanChip({
  label,
  icon: Icon,
  selected,
  onSelect,
}: {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          paddingHorizontal: 16,
          height: theme.controlHeight.chip,
          borderRadius: theme.radius.pill,
          borderWidth: selected ? 2 : 1.5,
          borderColor: selected ? theme.color.action : theme.color.borderStrong,
          backgroundColor: selected ? theme.color.actionTint : theme.color.surface,
        },
        selected ? theme.shadow.raised : null,
      ]}>
      <Icon size={18} color={selected ? theme.color.action : theme.color.textMuted} />
      <Text
        variant={selected ? 'smallStrong' : 'label'}
        color={selected ? 'text' : 'textMuted'}
        style={{ fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
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
        {plan.iconUrl ? (
          // The badge is a shaped, transparent image, so it is shown whole rather
          // than cropped to a circle. It is what members of this plan carry.
          <Image
            source={{ uri: plan.iconUrl }}
            style={{ width: 56, height: 56 }}
            contentFit="contain"
            accessibilityLabel={t('register.planBadge', { plan: plan.name })}
          />
        ) : (
          // No icon uploaded for this plan: our own placeholder, as the API asks.
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
        )}
        <Text variant="display" color="textOnInk" style={{ flex: 1 }}>
          {plan.name}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text variant="amount" color="brand" style={{ fontSize: 54, lineHeight: 56 }}>
          {`$${plan.priceUsd}`}
        </Text>
        <Text variant="bodyMedium" color="textOnInkSoft">
          {t('register.perMonth')}
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

function MonthsChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: theme.radius.pill,
        borderWidth: selected ? 2 : 1.5,
        borderColor: selected ? theme.color.action : theme.color.borderStrong,
        backgroundColor: selected ? theme.color.actionTint : theme.color.surface,
      }}>
      <Text variant="smallStrong" color={selected ? 'text' : 'textSecondary'}>
        {label}
      </Text>
    </Pressable>
  );
}
