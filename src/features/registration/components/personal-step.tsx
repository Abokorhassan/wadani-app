import { Image } from 'expo-image';
import { Camera, Plus } from 'lucide-react-native';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  PasswordField,
  PhoneField,
  SegmentedTabs,
  SelectField,
  Text,
  TextField,
  useTheme,
} from '@/design-system';
import type { EducationLevel, Gender } from '@/features/membership';

import type { RegistrationForm } from '../form';
import { usePhotoPicker } from '../use-photo-picker';

const EDUCATION_LEVELS: EducationLevel[] = [
  'primary',
  'secondary',
  'diploma',
  'bachelor',
  'master',
  'doctorate',
  'other',
];

export interface PersonalStepProps {
  control: Control<RegistrationForm>;
  /** Checks the email with the server once the member leaves the field. */
  onEmailBlur?: () => void;
}

export function PersonalStep({ control, onEmailBlur }: PersonalStepProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  // Members abroad register with their own number; only wallets must be Somali.
  const countryPicker = {
    title: t('register.countryCode'),
    searchPlaceholder: t('register.countrySearch'),
  };

  return (
    <View style={{ gap: theme.spacing.gutter }}>
      <Controller
        control={control}
        name="photoUri"
        render={({ field, fieldState }) => (
          <PhotoRow uri={field.value} onPick={field.onChange} error={fieldState.error?.message} />
        )}
      />

      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.fullName')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.fullNamePlaceholder')}
            autoCapitalize="words"
          />
        )}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field, fieldState }) => (
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="label" color="textSecondary">
              {t('register.gender')}
            </Text>
            <SegmentedTabs
              value={field.value ?? ''}
              onChange={(value) => field.onChange(value as Gender)}
              items={[
                { key: 'male', label: t('register.male') },
                { key: 'female', label: t('register.female') },
              ]}
            />
            {fieldState.error ? (
              <Text variant="caption" color="danger" style={{ fontFamily: theme.fonts.text600 }}>
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <PhoneField
            label={t('register.phone')}
            countryPicker={countryPicker}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="whatsapp"
        render={({ field, fieldState }) => (
          <PhoneField
            label={t('register.whatsapp')}
            countryPicker={countryPicker}
            optional={t('common.optional')}
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.email')}

            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={() => {
              field.onBlur();
              onEmailBlur?.();
            }}
            error={fieldState.error?.message}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />

      <Controller
        control={control}
        name="birthYear"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.birthYear')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.birthYearPlaceholder')}
            keyboardType="number-pad"
            maxLength={4}
          />
        )}
      />

      <Controller
        control={control}
        name="education"
        render={({ field, fieldState }) => (
          <SelectField
            label={t('register.education')}
            value={field.value}
            onChange={(value) => field.onChange(value as EducationLevel)}
            error={fieldState.error?.message}
            placeholder={t('register.educationPlaceholder')}
            options={EDUCATION_LEVELS.map((level) => ({
              value: level,
              label: t(`education.${level}`),
            }))}
          />
        )}
      />

      <Controller
        control={control}
        name="professionalWork"
        render={({ field, fieldState }) => (
          <TextField
            label={t('register.work')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.workPlaceholder')}
            autoCapitalize="words"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordField
            label={t('register.password')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder={t('register.passwordPlaceholder')}
          />
        )}
      />
    </View>
  );
}

function PhotoRow({
  uri,
  onPick,
  error,
}: {
  uri?: string;
  onPick: (uri: string) => void;
  error?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const pick = usePhotoPicker(onPick);

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Pressable
        onPress={() => void pick()}
        accessibilityRole="button"
        accessibilityLabel={t('register.addPhoto')}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.lg,
          padding: 14,
          borderRadius: theme.radius.card,
          borderWidth: error ? 2 : 1,
          borderColor: error ? theme.color.danger : theme.color.border,
          backgroundColor: pressed ? theme.color.surfaceSunken : theme.color.surface,
        })}>
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: 68, height: 68, borderRadius: 34 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: 68,
              height: 68,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 34,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: theme.color.borderStrong,
              backgroundColor: theme.color.surfaceSunken,
            }}>
            <Camera size={24} color={theme.color.textSecondary} />
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">
            {uri ? t('register.changePhoto') : t('register.addPhoto')}
          </Text>
          <Text variant="caption" color="textMuted">
            {t('register.photoHint')}
          </Text>
        </View>
        <Plus size={22} color={theme.color.actionDeep} />
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger" style={{ fontFamily: theme.fonts.text600 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
