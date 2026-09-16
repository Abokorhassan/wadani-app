import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar, Button, Card, Screen, StatusPill, Text, useTheme } from '@/design-system';
import { useSessionStore } from '@/features/auth/session-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const member = useSessionStore((state) => state.member);
  const signOut = useSessionStore((state) => state.signOut);

  return (
    <Screen>
      <View style={{ paddingTop: theme.spacing.lg, gap: theme.spacing.lg }}>
        <Text variant="title">Profile</Text>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
            <Avatar name={member?.fullName ?? 'Member'} size={56} />
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Text variant="bodyStrong">{member?.fullName ?? 'Member'}</Text>
              <Text variant="mono" color="textMuted">
                {member?.id ?? '—'}
              </Text>
              <StatusPill label={member?.status ?? 'unknown'} tone="success" />
            </View>
          </View>
        </Card>

        <Text variant="small" color="textMuted">
          Profile details are built in Phase 2.
        </Text>

        <Button label={t('common.logOut')} variant="danger" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}
