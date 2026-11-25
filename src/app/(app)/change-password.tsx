import { useRouter } from 'expo-router';
import { ChevronLeft, KeyRound } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, type TextInput } from 'react-native';

import { asApiError, isApiError } from '@/api/errors';
import {
  Button,
  IconButton,
  IconTile,
  PasswordField,
  Screen,
  Text,
  useTheme,
  useToast,
} from '@/design-system';
import { useChangePassword, useSessionStore } from '@/features/auth';

type Errors = { current?: string; newPassword?: string; confirm?: string };

/**
 * Two ways in. Straight after logging in with a temporary password a staff
 * member set, the app shows nothing else until the member picks their own
 * (the auth gate holds them here). Or from Profile, to change it any time.
 */
export default function ChangePasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const change = useChangePassword();
  const forced = useSessionStore((state) => state.mustChangePassword);
  const temporaryPassword = useSessionStore((state) => state.temporaryPassword);
  const signOut = useSessionStore((state) => state.signOut);

  // The temporary password was typed a moment ago at login, so it is not asked
  // for again. After an app restart it is gone, and the field comes back.
  const [askCurrent, setAskCurrent] = useState(!(forced && temporaryPassword));
  // The keyboard's Next key moves down the fields, and Done on the last one saves.
  const newRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const clear = (field: keyof Errors) =>
    setErrors((existing) => ({ ...existing, [field]: undefined }));

  const submit = () => {
    const currentPassword = askCurrent ? current : (temporaryPassword ?? '');
    const next: Errors = {};
    if (askCurrent && !current) next.current = t('changePassword.currentRequired');
    if (newPassword.length < 8) next.newPassword = t('forgot.passwordTooShort');
    else if (newPassword === currentPassword) next.newPassword = t('changePassword.sameAsCurrent');
    else if (confirm !== newPassword) next.confirm = t('forgot.passwordMismatch');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.show(t('changePassword.done'), 'success');
          // The index route decides what comes next: Home, or the pending screen.
          if (forced) router.replace('/');
          else router.back();
        },
        onError: (error) => {
          const details = isApiError(error) ? asApiError(error) : null;
          if (details?.kind === 'validation' && details.code === 'WRONG_CURRENT_PASSWORD') {
            setAskCurrent(true);
            setErrors({ current: t('changePassword.wrongCurrent') });
            return;
          }
          if (details?.kind === 'validation' && details.fieldErrors.newPassword) {
            setErrors({ newPassword: details.fieldErrors.newPassword });
            return;
          }
          toast.show(
            details?.kind === 'network' ? t('errors.network') : t('changePassword.failed'),
            'danger'
          );
        },
      }
    );
  };

  /*
   * The button sits under the fields, not pinned above the keyboard: on a page
   * this short a pinned button covered the next field and nothing could scroll
   * it out of the way (2026-11-25). Login and password reset work the same way.
   */
  return (
    <Screen>
      {forced ? (
        <View style={{ paddingTop: theme.spacing.xl }}>
          <IconTile icon={KeyRound} tone="action" size={56} />
        </View>
      ) : (
        <View style={{ paddingTop: theme.spacing.md }}>
          <IconButton
            icon={ChevronLeft}
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}
          />
        </View>
      )}

      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.gutter }}>
        <Text variant="title">
          {forced ? t('changePassword.titleForced') : t('changePassword.title')}
        </Text>
        <Text variant="body" color="textMuted">
          {forced ? t('changePassword.subtitleForced') : t('changePassword.subtitle')}
        </Text>
      </View>

      <View style={{ gap: 18, marginTop: theme.spacing.xxl }}>
        {askCurrent ? (
          <PasswordField
            label={forced ? t('changePassword.temporary') : t('changePassword.current')}
            value={current}
            onChangeText={(value) => {
              setCurrent(value);
              clear('current');
            }}
            error={errors.current}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => newRef.current?.focus()}
          />
        ) : null}
        <PasswordField
          ref={newRef}
          label={t('forgot.newPassword')}
          autoComplete="new-password"
          value={newPassword}
          onChangeText={(value) => {
            setNewPassword(value);
            clear('newPassword');
          }}
          error={errors.newPassword}
          placeholder={t('register.passwordPlaceholder')}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <PasswordField
          ref={confirmRef}
          label={t('forgot.confirmPassword')}
          autoComplete="new-password"
          value={confirm}
          onChangeText={(value) => {
            setConfirm(value);
            clear('confirm');
          }}
          error={errors.confirm}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.xl }}>
        <Button label={t('changePassword.submit')} loading={change.isPending} onPress={submit} />
        {forced ? (
          // The only way out without a new password: someone else's phone, say.
          <Text
            variant="smallStrong"
            color="actionDeep"
            center
            accessibilityRole="button"
            onPress={() => void signOut()}>
            {t('changePassword.logOutInstead')}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
