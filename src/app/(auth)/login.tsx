import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, PasswordField, Screen, Text, TextField, useTheme } from '@/design-system';
import { useSessionStore } from '@/features/auth/session-store';

/**
 * Phase 0 shell: the form is real, the submit is not. Phase 1 replaces this
 * with `POST /auth/login` plus status routing (build-plan D1, D2).
 */
export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const signIn = useSessionStore((state) => state.signIn);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const onDemoLogin = () =>
    void signIn({
      accessToken: 'demo-token',
      member: { id: 'WD-482913', fullName: 'Mohamed Shibbin', status: 'active' },
    });

  return (
    <Screen>
      <View style={{ paddingTop: theme.spacing.xl }}>
        <Text variant="title">{t('login.title')}</Text>
        <Text variant="small" color="textMuted" style={{ marginTop: theme.spacing.xs }}>
          {t('login.subtitle')}
        </Text>
      </View>

      <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.lg + 2 }}>
        <TextField
          label={t('login.identifier')}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="+252 63 234 5678"
        />
        <PasswordField label={t('login.password')} value={password} onChangeText={setPassword} />

        <Button label={t('common.logIn')} onPress={onDemoLogin} />
        <Button
          label={t('common.back')}
          variant="ghost"
          onPress={() => router.back()}
          style={{ marginTop: theme.spacing.sm }}
        />

        <Text variant="caption" color="textMuted" center style={{ marginTop: theme.spacing.xl }}>
          Phase 0 shell — logging in creates a demo session so the app shell can be reviewed.
        </Text>
      </View>
    </Screen>
  );
}
