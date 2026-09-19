import { Check } from 'lucide-react-native';
import { Controller, type Control } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { IconTile, Text, TextField, useTheme } from '@/design-system';
import { PAYMENT_METHODS, type PaymentMethodId } from '@/features/payments';

import type { RegistrationForm } from '../form';

const METHOD_IDS = Object.keys(PAYMENT_METHODS) as PaymentMethodId[];

export interface PaymentStepProps {
  control: Control<RegistrationForm>;
  /** Shown under the amount: which plan and period it came from (build-plan D5). */
  amountHint?: string;
}

export function PaymentStep({ control, amountHint }: PaymentStepProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ gap: theme.spacing.xl }}>
      <Controller
        control={control}
        name="method"
        render={({ field }) => (
          <View style={{ gap: 10 }}>
            <Text variant="label" color="textSecondary">
              {t('register.method')}
            </Text>
            <View style={{ gap: 10 }}>
              {METHOD_IDS.map((id) => {
                const info = PAYMENT_METHODS[id];
                const selected = id === field.value;
                return (
                  <Pressable
                    key={id}
                    onPress={() => field.onChange(id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={info.label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      padding: 12,
                      paddingRight: 14,
                      borderRadius: theme.radius.button,
                      borderWidth: selected ? 2 : 1.5,
                      borderColor: selected ? theme.color.action : theme.color.border,
                      backgroundColor: theme.color.surface,
                    }}>
                    <IconTile icon={info.icon} tone={info.tone} />
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text variant="bodyStrong">{info.label}</Text>
                      <Text variant="caption" color="textMuted">
                        {t(`register.methodHints.${id}`)}
                      </Text>
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
                      {selected ? (
                        <Check size={14} color={theme.color.textOnAction} strokeWidth={3} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.amount')}
            prefix="$"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            hint={amountHint}
            keyboardType="decimal-pad"
          />
        )}
      />

      <Controller
        control={control}
        name="account"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.account')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.accountPlaceholder')}
          />
        )}
      />

      <Controller
        control={control}
        name="reference"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.reference')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.referencePlaceholder')}
          />
        )}
      />

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
                    terms: <Text variant="small" color="actionDeep" />,
                    privacy: <Text variant="small" color="actionDeep" />,
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
