import { Image } from 'expo-image';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  IdCard,
  Star,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Controller, type Control, type UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { ErrorState, Rosette, Skeleton, Text, useTheme } from '@/design-system';
import {
  amountInPlanRange,
  isRangePlan,
  planRange,
  usePlans,
  type Plan,
} from '@/features/membership';
import { formatUsd } from '@/lib/format';
import { parseMoney } from '@/lib/money';

import { MAX_MONTHS, MIN_MONTHS, monthsOf, type RegistrationForm } from '../form';
import { quoteFor } from '../quote';
import { amountText, shortUsd, StepperField, suggestedAmounts } from './stepper-field';

/** Plan ids are uuids, so the backend's `stars` rank picks the icon. */
const PLAN_ICONS: readonly LucideIcon[] = [IdCard, Star, Crown];

const planIconRank = (stars?: number): number => (!stars || stars <= 1 ? 0 : stars >= 3 ? 2 : 1);

/** One tap for the lengths most members pick; any other can be typed. */
const QUICK_MONTHS = [1, 6, 12, 24];

/** Benefit lines shown before "+N more": enough to judge a plan by. */
const BENEFITS_SHOWN = 3;

/** Whole dollars on a narrow range, fives on a wide one, so − and + stay useful. */
const amountStep = (min: number, max: number) => (max - min > 20 ? 5 : 1);

export interface PlanStepProps {
  control: Control<RegistrationForm>;
  planId: string;
  /** The monthly amount, chosen from the plan's range. */
  amount: string;
  months: string;
  setValue: UseFormSetValue<RegistrationForm>;
}

export function PlanStep({ control, planId, amount, months, setValue }: PlanStepProps) {
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
  const range = plan ? planRange(plan) : null;
  const quote = quoteFor(plan, amount, months);

  /*
   * Writes the field and, once the new value is a usable one, clears any error
   * still on it. The form validates on blur, but a chip or the +/- buttons never
   * blur anything, so a corrected figure kept its old error. Validating on every
   * keystroke instead would flash an error at "2" on the way to "25".
   */
  const setChoice = (field: 'amount' | 'months', value: string, valid: boolean) =>
    setValue(field, value, { shouldDirty: true, shouldValidate: valid });

  /*
   * Start the amount at the bottom of the plan's range, and move it back inside
   * when the plan changes, or when the backend changes the plan's price under
   * us (the plans refetch). Only then, never while the member types: "2" on the
   * way to "25" is below the range for a moment. A fixed-price plan's amount is
   * simply its price, and has no field to show an error on, so it must be right.
   */
  const seeded = useRef<string | null>(null);
  useEffect(() => {
    if (!plan) return;
    const key = `${plan.id}:${plan.priceUsd}:${plan.priceMaxUsd ?? ''}`;
    if (seeded.current === key) return;
    seeded.current = key;
    const current = parseMoney(amount);
    if (current === null || !amountInPlanRange(plan, current)) {
      setValue('amount', amountText(planRange(plan).min), { shouldValidate: true });
    }
  }, [plan, amount, setValue]);

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
        <Skeleton height={260} radius={theme.radius.hero} />
      ) : null}

      {/*
        One card for what it costs: the monthly amount, how long, and the total
        they come to. Keeping them together is what makes the sum obvious -- as
        separate blocks the member had to hold the figures in their head while
        scrolling between them.
      */}
      {plan && range ? (
        <View
          style={{
            gap: theme.spacing.lg,
            padding: 18,
            borderRadius: theme.radius.card,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.surface,
          }}>
          {isRangePlan(plan) ? (
            <>
              <Controller
                control={control}
                name="amount"
                render={({ field, fieldState }) => (
                  <StepperField
                    label={t('register.monthlyAmount')}
                    hint={t('register.amountRange', {
                      min: shortUsd(range.min),
                      max: shortUsd(range.max),
                    })}
                    prefix="$"
                    value={field.value}
                    onChange={(next) => {
                      const typed = parseMoney(next);
                      setChoice('amount', next, typed !== null && amountInPlanRange(plan, typed));
                    }}
                    onBlur={field.onBlur}
                    min={range.min}
                    max={range.max}
                    step={amountStep(range.min, range.max)}
                    options={suggestedAmounts(
                      range.min,
                      range.max,
                      amountStep(range.min, range.max)
                    )}
                    optionLabel={shortUsd}
                    format={amountText}
                    parse={parseMoney}
                    keyboardType="decimal-pad"
                    maxLength={7}
                    lowerLabel={t('register.amountLower')}
                    higherLabel={t('register.amountHigher')}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Divider />
            </>
          ) : null}

          <Controller
            control={control}
            name="months"
            render={({ field, fieldState }) => (
              <StepperField
                label={t('register.months')}
                hint={t('register.monthsHint', { min: MIN_MONTHS, max: MAX_MONTHS })}
                suffix={t('register.monthsWord', { count: monthsOf(field.value) ?? 0 })}
                value={field.value}
                onChange={(next) => {
                  const typed = monthsOf(next);
                  setChoice(
                    'months',
                    next,
                    typed !== null && typed >= MIN_MONTHS && typed <= MAX_MONTHS
                  );
                }}
                onBlur={field.onBlur}
                min={MIN_MONTHS}
                max={MAX_MONTHS}
                step={1}
                options={QUICK_MONTHS}
                optionLabel={String}
                optionA11yLabel={(value) => t('register.monthsUnit', { count: value })}
                format={String}
                parse={monthsOf}
                keyboardType="number-pad"
                maxLength={2}
                lowerLabel={t('register.monthsLower')}
                higherLabel={t('register.monthsHigher')}
                error={fieldState.error?.message}
              />
            )}
          />

          <Divider />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="smallStrong" color="textSecondary" style={{ fontSize: 15 }}>
                {t('register.total')}
              </Text>
              {quote ? (
                <Text variant="caption" color="textMuted">
                  {t('register.totalFormula', {
                    price: formatUsd(quote.monthlyUsd),
                    months: t('register.monthsUnit', { count: quote.months }),
                  })}
                </Text>
              ) : null}
            </View>
            <Text variant="display" style={{ fontSize: 28, lineHeight: 32 }}>
              {quote ? formatUsd(quote.totalUsd) : '—'}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Hairline across the card, between one choice and the next. */
function Divider() {
  const theme = useTheme();
  return <View style={{ height: 1, marginHorizontal: -18, backgroundColor: theme.color.border }} />;
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
  const [showAll, setShowAll] = useState(false);
  const Icon = PLAN_ICONS[planIconRank(plan.stars)];
  const range = planRange(plan);
  // A long benefit list buried the choices under it, so only the first few show.
  const hidden = Math.max(0, plan.benefits.length - BENEFITS_SHOWN);
  const benefits = showAll ? plan.benefits : plan.benefits.slice(0, BENEFITS_SHOWN);

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          gap: theme.spacing.lg,
          padding: 22,
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
            style={{ width: 48, height: 48 }}
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
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading" color="textOnInk">
            {plan.name}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 5 }}>
            <Text variant="display" color="brand" style={{ fontSize: 30, lineHeight: 34 }}>
              {isRangePlan(plan)
                ? `${shortUsd(range.min)}–${shortUsd(range.max)}`
                : shortUsd(range.min)}
            </Text>
            <Text variant="caption" color="textOnInkSoft">
              {t('register.perMonth')}
            </Text>
          </View>
        </View>
      </View>

      {/*
        The live plan carries no benefit lines at all, so the divider and the
        heading would frame an empty space. Both only appear when there is
        something to list.
      */}
      {plan.benefits.length > 0 ? (
        <>
          <View style={{ height: 1, backgroundColor: 'rgba(255, 239, 219, 0.12)' }} />
          <View style={{ gap: 12 }}>
            <Text variant="overline" color="textOnInkFaint">
              {t('register.topBenefits')}
            </Text>
            {benefits.map((benefit) => (
              <View
                key={benefit}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    marginTop: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    backgroundColor: theme.color.brand,
                  }}>
                  <Check size={12} color={theme.color.textOnBrand} strokeWidth={3} />
                </View>
                <Text variant="small" color="textOnInk" style={{ flex: 1 }}>
                  {benefit}
                </Text>
              </View>
            ))}
            {hidden > 0 ? (
              <Pressable
                onPress={() => setShowAll((shown) => !shown)}
                accessibilityRole="button"
                accessibilityState={{ expanded: showAll }}
                hitSlop={8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="smallStrong" color="brand">
                  {showAll
                    ? t('register.fewerBenefits')
                    : t('register.moreBenefits', { count: hidden })}
                </Text>
                {showAll ? (
                  <ChevronUp size={16} color={theme.color.brand} />
                ) : (
                  <ChevronDown size={16} color={theme.color.brand} />
                )}
              </Pressable>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}
