import { Check } from 'lucide-react-native';
import { Controller, type Control } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { PhoneField, Text, useTheme } from '@/design-system';
import { PaymentMethodPicker } from '@/features/payments';
import { openLegalPage } from '@/features/settings';

import type { RegistrationForm } from '../form';

export interface PaymentStepProps {
  control: Control<RegistrationForm>;
  /**
   * What will be charged, worked out from the plan and the months: there is no
   * amount to type any more (2026-09-29). Missing until the plan has loaded.
   */
  total?: { amount: string; formula: string };
  /** Wallet charges need a number to bill; a card payment does not. */
  wallet: boolean;
  /**
   * Why the last attempt failed, in the backend's own words. Shown here and
   * kept on screen: the member is on the last step, and moving them elsewhere
   * to read it loses the explanation (build-plan D7, revised 2026-09-23).
   */
  submitError?: string | null;
}

export function PaymentStep({ control, total, wallet, submitError }: PaymentStepProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ gap: theme.spacing.xl }}>
      {submitError ? (
        <View
          accessibilityRole="alert"
          style={{
            gap: 4,
            padding: 16,
            borderRadius: theme.radius.card,
            borderWidth: 1,
            borderColor: theme.color.danger,
            backgroundColor: theme.color.dangerTint,
          }}>
          <Text variant="smallStrong" color="danger">
            {t('register.couldNotFinish')}
          </Text>
          <Text variant="small" color="text" style={{ lineHeight: 21 }}>
            {submitError}
          </Text>
        </View>
      ) : null}

      <Controller
        control={control}
        name="method"
        render={({ field, fieldState }) => (
          <View style={{ gap: 10 }}>
            <Text variant="label" color="textSecondary">
              {t('register.method')}
            </Text>
            <PaymentMethodPicker
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          </View>
        )}
      />

      {total ? (
        <View
          accessibilityRole="summary"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
            padding: 18,
            borderRadius: theme.radius.card,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.surface,
          }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="smallStrong" color="textSecondary" style={{ fontSize: 15 }}>
              {t('register.toPay')}
            </Text>
            <Text variant="caption" color="textMuted">
              {total.formula}
            </Text>
          </View>
          <Text variant="display" style={{ fontSize: 26, lineHeight: 30 }}>
            {total.amount}
          </Text>
        </View>
      ) : null}

      {wallet ? (
        <Controller
          control={control}
          name="payerPhone"
          render={({ field, fieldState }) => (
            <PhoneField
              label={t('register.payerPhone')}
              hint={t('register.payerPhoneHint')}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      ) : (
        <Text variant="small" color="textMuted">
          {t('register.cardNote')}
        </Text>
      )}

      <Controller
        control={control}
        name="acceptedTerms"
        render={({ field, fieldState }) => (
          <View style={{ gap: theme.spacing.sm }}>
            <Pressable
              onPress={() => field.onChange(!field.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: Boolean(field.value) }}
              accessibilityLabel={t('register.consentLabel')}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.radius.sm,
                  borderWidth: field.value ? 0 : 2,
                  borderColor: fieldState.error ? theme.color.danger : theme.color.borderStrong,
                  backgroundColor: field.value ? theme.color.action : 'transparent',
                }}>
                {field.value ? (
                  <Check size={14} color={theme.color.textOnAction} strokeWidth={3} />
                ) : null}
              </View>
              <Text variant="small" color="textSecondary" style={{ flex: 1, lineHeight: 21 }}>
                <Trans
                  i18nKey="register.consent"
                  components={{
                    terms: (
                      <Text
                        variant="small"
                        color="actionDeep"
                        style={{ textDecorationLine: 'underline' }}
                        accessibilityRole="link"
                        onPress={() => openLegalPage('terms')}
                      />
                    ),
                    privacy: (
                      <Text
                        variant="small"
                        color="actionDeep"
                        style={{ textDecorationLine: 'underline' }}
                        accessibilityRole="link"
                        onPress={() => openLegalPage('privacy')}
                      />
                    ),
                  }}
                />
              </Text>
            </Pressable>
            {fieldState.error ? (
              <Text variant="caption" color="danger" style={{ fontFamily: theme.fonts.text600 }}>
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}
