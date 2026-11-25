import { Image } from 'expo-image';
import { Award, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { IconTile, Text, useTheme } from '@/design-system';

import type { MyPlan } from '../types';

export interface PlanBenefitsCardProps {
  plan: MyPlan;
  style?: StyleProp<ViewStyle>;
}

/** The member's own plan and what it gives them, from GET /mobile/members/me/plan. */
export function PlanBenefitsCard({ plan, style }: PlanBenefitsCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  // A free plan carries no badge (MOBILE_FREE_PLAN.md §3).
  const badgeUrl = plan.free ? undefined : plan.iconUrl;

  return (
    <View
      style={[
        {
          gap: theme.spacing.md,
          padding: 18,
          borderRadius: theme.radius.card,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.surface,
        },
        style,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {badgeUrl ? (
          <View style={{ width: 44, height: 44, overflow: 'hidden', borderRadius: 22 }}>
            <Image source={{ uri: badgeUrl }} style={{ flex: 1 }} contentFit="cover" />
          </View>
        ) : (
          <IconTile icon={Award} tone="brand" size={44} />
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="overline" color="textMuted">
            {t('profile.yourPlan')}
          </Text>
          <Text variant="heading">
            {plan.parentName ? `${plan.parentName} · ${plan.name}` : plan.name}
          </Text>
        </View>
      </View>

      {plan.description ? (
        <Text variant="small" color="textSecondary" style={{ lineHeight: 21 }}>
          {plan.description}
        </Text>
      ) : null}

      <View style={{ height: 1, backgroundColor: theme.color.border }} />

      <View style={{ gap: 10 }}>
        <Text variant="label" color="textSecondary">
          {t('profile.benefits')}
        </Text>
        {plan.benefits.length > 0 ? (
          plan.benefits.map((benefit) => (
            <View
              key={benefit}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  marginTop: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  backgroundColor: theme.color.actionTint,
                }}>
                <Check size={12} color={theme.color.actionDeep} strokeWidth={3} />
              </View>
              <Text variant="small" style={{ flex: 1, lineHeight: 21 }}>
                {benefit}
              </Text>
            </View>
          ))
        ) : (
          <Text variant="small" color="textMuted">
            {t('profile.noBenefits')}
          </Text>
        )}
      </View>
    </View>
  );
}
