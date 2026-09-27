import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, KeyRound, MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { asApiError, isApiError } from '@/api/errors';
import {
  Button,
  IconButton,
  IconTile,
  PasswordField,
  Screen,
  Text,
  TextField,
  useTheme,
  useToast,
} from '@/design-system';
import { useRequestPasswordReset, useResetPassword } from '@/features/auth';
import { LanguageSwitch } from '@/features/settings';
import { openWhatsApp, useContactInfo } from '@/features/support';
import { toInternationalPhone } from '@/lib/phone';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { identifier?: string; otp?: string; newPassword?: string; confirm?: string };

/**
 * Password reset (build-plan D10): the member asks for a code, the API emails
 * it, and the member types it here with a new password. The code only goes by
 * email, so WhatsApp stays as the way out for members with no email on file.
 */
export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const contact = useContactInfo();
  const requestCode = useRequestPasswordReset();
  const reset = useResetPassword();
  const params = useLocalSearchParams<{ identifier?: string }>();

  const [stage, setStage] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState(params.identifier ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const clear = (field: keyof Errors) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  /** Why a code could not be sent, in words for the member. */
  const sendError = (error: unknown): string => {
    const details = asApiError(error);
    if (details.kind === 'not_found') return t('forgot.accountNotFound');
    if (details.kind === 'declined' && details.code === 'NO_EMAIL_ON_FILE') {
      return t('forgot.noEmailOnAccount');
    }
    if (details.kind === 'network') return t('errors.network');
    return t('forgot.sendFailed');
  };

  const sendCode = (onSent?: () => void) => {
    const value = identifier.trim();
    if (!value) {
      setErrors({ identifier: t('login.identifierRequired') });
      return;
    }
    if (value.includes('@') ? !EMAIL.test(value) : toInternationalPhone(value) === null) {
      setErrors({ identifier: t('forgot.identifierInvalid') });
      return;
    }
    requestCode.mutate(value, {
      onSuccess: () => {
        setStage('reset');
        onSent?.();
      },
      // On the code screen the phone/email field is gone, so a failed resend is a toast.
      onError: (error) =>
        stage === 'request'
          ? setErrors({ identifier: sendError(error) })
          : toast.show(sendError(error), 'danger'),
    });
  };

  const submit = () => {
    const next: Errors = {};
    if (!/^\d{6}$/.test(otp)) next.otp = t('forgot.codeInvalid');
    if (newPassword.length < 8) next.newPassword = t('forgot.passwordTooShort');
    else if (confirm !== newPassword) next.confirm = t('forgot.passwordMismatch');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    reset.mutate(
      { identifier: identifier.trim(), otp, newPassword },
      {
        onSuccess: ({ signedIn }) => {
          if (signedIn) {
            toast.show(t('forgot.done'), 'success');
            router.replace('/home');
          } else {
            toast.show(t('forgot.doneLogIn'), 'success');
            router.replace({ pathname: '/login', params: { identifier: identifier.trim() } });
          }
        },
        onError: (error) => {
          // The API answers a wrong, expired or used code, and an unknown
          // account, with the same 400.
          if (isApiError(error) && asApiError(error).kind === 'validation') {
            setErrors({ otp: t('forgot.codeRejected') });
            return;
          }
          toast.show(t('errors.unexpected'), 'danger');
        },
      }
    );
  };

  const askOnWhatsApp = () => {
    if (!contact.data) return;
    void openWhatsApp(contact.data.whatsappNumber, t('login.forgotMessage'));
  };

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: theme.spacing.md,
        }}>
        <IconButton
          icon={ChevronLeft}
          accessibilityLabel={t('common.back')}
          onPress={() => (stage === 'reset' ? setStage('request') : router.back())}
        />
        <LanguageSwitch />
      </View>

      <View style={{ marginTop: 26 }}>
        <IconTile icon={stage === 'request' ? KeyRound : MailCheck} tone="brand" size={56} />
        <Text variant="hero" style={{ marginTop: theme.spacing.gutter }}>
          {stage === 'request' ? t('login.forgotTitle') : t('forgot.checkEmailTitle')}
        </Text>
        <Text variant="body" color="textMuted" style={{ marginTop: theme.spacing.sm }}>
          {stage === 'request' ? t('forgot.subtitle') : t('forgot.checkEmailSubtitle')}
        </Text>
      </View>

      {stage === 'request' ? (
        <View style={{ gap: 18, marginTop: theme.spacing.xxl }}>
          <TextField
            label={t('login.identifier')}
            value={identifier}
            onChangeText={(value) => {
              setIdentifier(value);
              clear('identifier');
            }}
            error={errors.identifier}
            placeholder={t('login.identifierPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <Button
            label={t('forgot.sendCode')}
            loading={requestCode.isPending}
            onPress={() => sendCode()}
          />
        </View>
      ) : (
        <View style={{ gap: 18, marginTop: theme.spacing.xxl }}>
          <TextField
            label={t('forgot.code')}
            value={otp}
            onChangeText={(value) => {
              setOtp(value.replace(/\D/g, '').slice(0, 6));
              clear('otp');
            }}
            error={errors.otp}
            placeholder="123456"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={6}
          />
          <PasswordField
            label={t('forgot.newPassword')}
            value={newPassword}
            onChangeText={(value) => {
              setNewPassword(value);
              clear('newPassword');
            }}
            error={errors.newPassword}
            placeholder={t('register.passwordPlaceholder')}
          />
          <PasswordField
            label={t('forgot.confirmPassword')}
            value={confirm}
            onChangeText={(value) => {
              setConfirm(value);
              clear('confirm');
            }}
            error={errors.confirm}
          />
          <Button label={t('forgot.submit')} loading={reset.isPending} onPress={submit} />
          <Text variant="small" color="textMuted" center>
            {t('forgot.noCode')}{' '}
            <Text
              variant="smallStrong"
              color="actionDeep"
              accessibilityRole="button"
              onPress={() => sendCode(() => toast.show(t('forgot.resent'), 'success'))}>
              {t('forgot.resend')}
            </Text>
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }} />

      <Text variant="small" color="textMuted" center style={{ marginTop: theme.spacing.xl }}>
        {t('forgot.noEmail')}{' '}
        <Text
          variant="smallStrong"
          color="actionDeep"
          accessibilityRole="button"
          onPress={askOnWhatsApp}>
          {t('forgot.askWhatsApp')}
        </Text>
      </Text>
    </Screen>
  );
}
