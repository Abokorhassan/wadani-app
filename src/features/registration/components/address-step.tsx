import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TextField, useTheme } from '@/design-system';

import type { RegistrationForm } from '../form';

export function AddressStep({ control }: { control: Control<RegistrationForm> }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ gap: theme.spacing.gutter }}>
      <Controller
        control={control}
        name="line1"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.addressLine')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.addressPlaceholder')}
          />
        )}
      />
      <Controller
        control={control}
        name="country"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.country')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={control}
        name="city"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.city')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.cityPlaceholder')}
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={control}
        name="region"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.region')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.regionPlaceholder')}
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={control}
        name="district"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.district')}
            optional
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="words"
          />
        )}
      />
    </View>
  );
}
