import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { asApiError, isApiError } from '@/api/errors';
import {
  Button,
  IconButton,
  PasswordField,
  Screen,
  Text,
  TextField,
  useTheme,
  useToast,
} from '@/design-system';
import { useLogin } from '@/features/auth';
import { openWhatsApp, useContactInfo } from '@/features/support';

const sealColor = require('@/assets/brand/seal-color.png');

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const login = useLogin();
  const contact = useContactInfo();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (!identifier.trim()) next.identifier = t('login.identifierRequired');
    if (!password) next.password = t('login.passwordRequired');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    login.mutate(
      { identifier: identifier.trim(), password },
      {
        onSuccess: () => router.replace('/home'),
        onError: (error) => {
          const details = isApiError(error) ? asApiError(error) : null;
          if (details?.kind === 'validation') {
            setErrors(details.fieldErrors);
            return;
          }
          toast.show(t('login.failed'), 'danger');
        },
      }
    );
  };

  /** No reset endpoint yet, so the office picks it up on WhatsApp (build-plan D10). */
  const forgotPassword = () => {
    if (!contact.data) return;
    void openWhatsApp(contact.data.whatsappNumber, t('login.forgotMessage'));
  };

  return (
    <Screen>
      <View style={{ paddingTop: theme.spacing.md }}>
        <IconButton
          icon={ChevronLeft}
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
        />
      </View>

      <View style={{ marginTop: 26 }}>
        <Image source={sealColor} style={{ width: 64, height: 64 }} />
        <Text variant="hero" style={{ marginTop: theme.spacing.gutter }}>
          {t('login.title')}
        </Text>
        <Text variant="body" color="textMuted" style={{ marginTop: theme.spacing.sm }}>
          {t('login.subtitle')}
        </Text>
      </View>

      <View style={{ gap: 18, marginTop: theme.spacing.xxl }}>
        <TextField
          label={t('login.identifier')}
          value={identifier}
          onChangeText={(value) => {
            setIdentifier(value);
            setErrors((current) => ({ ...current, identifier: undefined }));
          }}
          error={errors.identifier}
          placeholder={t('login.identifierPlaceholder')}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <PasswordField
          label={t('login.password')}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          placeholder={t('login.passwordPlaceholder')}
        />
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            variant="smallStrong"
            color="actionDeep"
            onPress={forgotPassword}
            accessibilityRole="button">
            {t('login.forgotPassword')}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <Button
          label={t('common.logIn')}
          iconRight={ArrowRight}
          loading={login.isPending}
          onPress={submit}
        />
      </View>

      <View style={{ flex: 1 }} />

      <Text variant="small" color="textMuted" center style={{ marginTop: theme.spacing.xl }}>
        {t('login.noAccount')}{' '}
        <Text variant="smallStrong" color="actionDeep" onPress={() => router.replace('/register')}>
          {t('login.createAccount')}
        </Text>
      </Text>
    </Screen>
  );
}
