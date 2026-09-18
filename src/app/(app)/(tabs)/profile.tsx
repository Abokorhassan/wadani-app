import { LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import {
  Avatar,
  Button,
  ErrorState,
  Screen,
  ScreenHeader,
  Skeleton,
  StatusPill,
  Text,
  useTheme,
} from '@/design-system';
import { useSessionStore } from '@/features/auth/session-store';
import { MEMBER_STATUS_TONE, useMe } from '@/features/membership';
import { formatMonthYear } from '@/lib/format';

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const me = useMe();
  const signOut = useSessionStore((state) => state.signOut);
  const member = me.data;

  const rows = member
    ? [
        { label: t('profile.memberId'), value: member.id, mono: true },
        { label: t('profile.tier'), value: member.plan.name },
        { label: t('profile.phone'), value: member.phone },
        { label: t('profile.education'), value: t(`education.${member.education}`) },
        ...(member.memberSince
          ? [{ label: t('profile.memberSince'), value: formatMonthYear(member.memberSince) }]
          : []),
      ]
    : [];

  return (
    <Screen
      withTabBar
      refreshControl={
        <RefreshControl
          refreshing={me.isRefetching}
          onRefresh={() => void me.refetch()}
          tintColor={theme.color.brand}
        />
      }>
      <ScreenHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      {member ? (
        <>
          <View
            style={{
              alignItems: 'center',
              gap: 14,
              marginTop: 22,
              paddingVertical: 24,
              paddingHorizontal: 20,
              borderRadius: theme.radius.hero,
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.surface,
            }}>
            <Avatar name={member.fullName} uri={member.photoUrl} size={96} radius={32} />
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text variant="headline" center>
                {member.fullName}
              </Text>
              <Text variant="small" color="textMuted" center>
                {member.email}
              </Text>
            </View>
            <StatusPill
              label={t('profile.statusMember', { status: t(`status.${member.status}`) })}
              tone={MEMBER_STATUS_TONE[member.status]}
              dot
              align="center"
            />
          </View>

          <View
            style={{
              marginTop: 14,
              borderRadius: theme.radius.card,
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.surface,
            }}>
            {rows.map((row, index) => (
              <View
                key={row.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  minHeight: 56,
                  paddingHorizontal: 18,
                  borderBottomWidth: index < rows.length - 1 ? 1 : 0,
                  borderBottomColor: theme.color.border,
                }}>
                <Text variant="small" color="textMuted" style={{ fontSize: 15 }}>
                  {row.label}
                </Text>
                <Text
                  variant={row.mono ? 'mono' : 'smallStrong'}
                  style={{ flexShrink: 1, textAlign: 'right' }}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : me.isError ? (
        <View style={{ marginTop: 22 }}>
          <ErrorState
            message={t('profile.loadFailed')}
            onRetry={() => void me.refetch()}
            retryLabel={t('common.retry')}
          />
        </View>
      ) : (
        <View style={{ marginTop: 22, gap: 14 }}>
          <Skeleton height={236} radius={theme.radius.hero} />
          <Skeleton height={280} radius={theme.radius.card} />
        </View>
      )}

      <View style={{ marginTop: 18 }}>
        <Button
          label={t('common.logOut')}
          icon={LogOut}
          variant="danger"
          onPress={() => void signOut()}
        />
      </View>
    </Screen>
  );
}
