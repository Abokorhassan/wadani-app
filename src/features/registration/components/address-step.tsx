import { useState } from 'react';
import { Controller, useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SelectField, TextField, useTheme } from '@/design-system';

import type { RegistrationForm } from '../form';
import { citiesFor, COUNTRIES, COUNTRY, regionsOf } from '../places';

/** The "Other" choice in Somaliland's town list; never sent to the API. */
const OTHER = '__other__';

/** A list shorter than this is picked from a plain sheet; longer ones also get a search box. */
const SEARCH_FROM = 12;

const asOptions = (names: readonly string[], current?: string) => {
  // A value saved in a draft that is not in the list must still show, not vanish.
  const all = current && !names.includes(current) ? [current, ...names] : names;
  return all.map((name) => ({ value: name, label: name }));
};

export interface AddressStepProps {
  control: Control<RegistrationForm>;
  setValue: UseFormSetValue<RegistrationForm>;
}

/**
 * The address from the largest area to the smallest, the standard order
 * (2026-10-11): country, region, city, district, street.
 *
 * Somaliland is listed first, with its own regions and towns to pick from. Any
 * other country can be chosen too, for members abroad; they pick a state or
 * province where we have a list and type the city.
 */
export function AddressStep({ control, setValue }: AddressStepProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  /*
   * useWatch, not a watch() function passed down: the React Compiler skips
   * redrawing a component whose props have not changed, so reading values
   * through a stable function left the town list empty after a region was
   * picked. The hook subscribes to the field itself.
   */
  const country = useWatch({ control, name: 'country' });
  const region = useWatch({ control, name: 'region' });
  const city = useWatch({ control, name: 'city' });

  const inSomaliland = country === COUNTRY;
  const regions = regionsOf(country);
  const towns = citiesFor(country, region);
  // A town already typed in (from a draft, or "Other") keeps its own text field.
  const [typingTown, setTypingTown] = useState(
    inSomaliland && Boolean(city) && !towns.includes(city)
  );

  return (
    <View style={{ gap: theme.spacing.gutter }}>
      <Controller
        control={control}
        name="country"
        render={({ field, fieldState }) => (
          <SelectField
            label={t('register.country')}
            value={field.value || undefined}
            onChange={(next) => {
              if (next === field.value) return;
              field.onChange(next);
              // A region and town belong to one country.
              setValue('region', '', { shouldDirty: true });
              setValue('city', '', { shouldDirty: true });
              setTypingTown(false);
            }}
            error={fieldState.error?.message}
            placeholder={t('register.countryChoose')}
            searchPlaceholder={t('register.searchList')}
            options={asOptions(COUNTRIES, field.value)}
          />
        )}
      />

      <Controller
        control={control}
        name="region"
        render={({ field, fieldState }) =>
          regions.length > 0 ? (
            <SelectField
              label={t('register.region')}
              value={field.value || undefined}
              onChange={(next) => {
                field.onChange(next);
                // A Somaliland town from the old region does not belong to the new one.
                if (inSomaliland && !typingTown && !citiesFor(country, next).includes(city)) {
                  setValue('city', '', { shouldDirty: true });
                }
              }}
              error={fieldState.error?.message}
              placeholder={t('register.regionChoose')}
              searchPlaceholder={
                regions.length > SEARCH_FROM ? t('register.searchList') : undefined
              }
              options={asOptions(regions, field.value)}
            />
          ) : (
            // A country with no state list: type it.
            <TextField
              label={t('register.region')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              placeholder={t('register.regionPlaceholder')}
              autoCapitalize="words"
            />
          )
        }
      />

      <Controller
        control={control}
        name="city"
        render={({ field, fieldState }) =>
          inSomaliland ? (
            <View style={{ gap: theme.spacing.md }}>
              <SelectField
                label={t('register.city')}
                value={typingTown ? OTHER : field.value || undefined}
                onChange={(next) => {
                  if (next === OTHER) {
                    setTypingTown(true);
                    field.onChange('');
                    return;
                  }
                  setTypingTown(false);
                  field.onChange(next);
                }}
                error={typingTown ? undefined : fieldState.error?.message}
                placeholder={region ? t('register.cityChoose') : t('register.chooseRegionFirst')}
                disabled={!region}
                options={[
                  ...towns.map((name) => ({ value: name, label: name })),
                  { value: OTHER, label: t('register.otherCity') },
                ]}
              />
              {typingTown ? (
                <TextField
                  label={t('register.cityName')}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  autoCapitalize="words"
                  autoFocus
                />
              ) : null}
            </View>
          ) : (
            <TextField
              label={t('register.cityName')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              placeholder={t('register.cityPlaceholderAbroad')}
              autoCapitalize="words"
            />
          )
        }
      />

      <Controller
        control={control}
        name="district"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.district')}
            optional={t('common.optional')}
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.districtPlaceholder')}
            autoCapitalize="words"
          />
        )}
      />

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
    </View>
  );
}
