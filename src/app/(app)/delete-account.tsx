import { useRouter } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { asApiError, isApiError, serverMessage } from '@/api/errors';
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
import { useDeleteAccount } from '@/features/auth';
import { openLegalPage } from '@/features/settings';

const WRONG_PASSWORD_CODES = new Set(['WRONG_PASSWORD', 'WRONG_CURRENT_PASSWORD']);

/**
 * Deleting the account from inside the app (App Review 5.1.1(v)). The password
 * is asked again, then a last "are you sure", then the member is signed out.
 * If the server ever answers 404, the member is sent to the request
 * instructions instead.
 */
export default function DeleteAccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const remove = useDeleteAccount();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();

  const deleteNow = () =>
    remove.mutate(
      { password },
      {
        // The session is already cleared; the auth gate shows the welcome screen.
        onSuccess: () => toast.show(t('deleteAccount.done'), 'success'),
        onError: (failure) => {
          const details = isApiError(failure) ? asApiError(failure) : null;
          if (
            details?.kind === 'validation' &&
            (WRONG_PASSWORD_CODES.has(details.code ?? '') || details.fieldErrors.password)
          ) {
            setError(t('deleteAccount.wrongPassword'));
            return;
          }
          if (details?.kind === 'not_found') {
            Alert.alert(
              t('deleteAccount.unavailableTitle'),
              t('deleteAccount.unavailableMessage'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('deleteAccount.howToAsk'),
                  onPress: () => openLegalPage('deleteAccount'),
                },
              ]
            );
            return;
          }
          // Signed out already if the session had expired; the gate shows the welcome screen.
          if (details?.kind === 'unauthorized') return;
          // Any other refusal (an unpaid balance, say) is shown in the server's own words.
          toast.show(
            details?.kind === 'network'
              ? t('errors.network')
              : ((details && serverMessage(details)) ?? t('deleteAccount.failed')),
            'danger'
          );
        },
      }
    );

  const submit = () => {
    if (!password) {
      setError(t('deleteAccount.passwordRequired'));
      return;
    }
    Alert.alert(t('deleteAccount.confirmTitle'), t('deleteAccount.confirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('deleteAccount.confirm'), style: 'destructive', onPress: deleteNow },
    ]);
  };

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing.lg }}>
          <Button
            label={t('deleteAccount.submit')}
            icon={Trash2}
            variant="danger"
            loading={remove.isPending}
            onPress={submit}
          />
          <Text
            variant="smallStrong"
            color="actionDeep"
            center
            accessibilityRole="link"
            onPress={() => openLegalPage('deleteAccount')}>
            {t('deleteAccount.readMore')}
          </Text>
        </View>
      }>
      <View style={{ paddingTop: theme.spacing.md }}>
        <IconButton
          icon={ChevronLeft}
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
        />
      </View>

      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.gutter }}>
        <IconTile icon={Trash2} tone="warning" size={56} />
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          {t('deleteAccount.title')}
        </Text>
        <Text variant="body" color="textMuted">
          {t('deleteAccount.subtitle')}
        </Text>
      </View>

      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
        {(['deleted', 'kept', 'noRefund'] as const).map((key) => (
          <View key={key} style={{ flexDirection: 'row', gap: 10 }}>
            <Text variant="body" color="textMuted">
              •
            </Text>
            <Text variant="body" color="textSecondary" style={{ flex: 1 }}>
              {t(`deleteAccount.${key}`)}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: theme.spacing.xxl }}>
        <PasswordField
          label={t('deleteAccount.password')}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError(undefined);
          }}
          error={error}
        />
      </View>
    </Screen>
  );
}
