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
import { isExpired, MEMBER_STATUS_TONE, useCard, useMe } from '@/features/membership';
import { formatMonthYear } from '@/lib/format';

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const member = useMe();
  const card = useCard();
  const signOut = useSessionStore((state) => state.signOut);

  // The backend has no profile endpoint, so the card fills the gaps for a
  // member who signed in on another device (docs/api-gaps.md, question 5).
  const name = member?.fullName ?? card.data?.memberFullName;
  const photoUrl = member?.photoUrl ?? card.data?.photoUrl;
  const status = member?.status;
  const ready = Boolean(member ?? card.data);

  const rows = [
    ...(card.data ? [{ label: t('profile.cardCode'), value: card.data.cardCode, mono: true }] : []),
    ...(card.data ? [{ label: t('profile.tier'), value: card.data.membershipType }] : []),
    ...(member ? [{ label: t('profile.phone'), value: member.phone }] : []),
    ...(member ? [{ label: t('profile.work'), value: member.professionalWork }] : []),
    ...(member ? [{ label: t('profile.education'), value: t(`education.${member.education}`) }] : []),
    ...(member?.memberSince
      ? [{ label: t('profile.memberSince'), value: formatMonthYear(member.memberSince) }]
      : []),
  ];

  return (
    <Screen
      withTabBar
      refreshControl={
        <RefreshControl
          refreshing={card.isRefetching}
          onRefresh={() => void card.refetch()}
          tintColor={theme.color.brand}
        />
      }>
      <ScreenHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      {ready ? (
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
            <Avatar name={name ?? ''} uri={photoUrl} size={96} radius={32} />
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text variant="headline" center>
                {name}
              </Text>
              <Text variant="small" color="textMuted" center>
                {member?.email ?? member?.phone ?? ''}
              </Text>
            </View>
            <StatusPill
              label={t('profile.statusMember', {
                status: status
                  ? t(`status.${status}`)
                  : card.data && isExpired(card.data)
                    ? t('status.expired')
                    : t('status.active'),
              })}
              tone={status ? MEMBER_STATUS_TONE[status] : 'success'}
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
      ) : card.isError ? (
        <View style={{ marginTop: 22 }}>
          <ErrorState
            message={t('profile.loadFailed')}
            onRetry={() => void card.refetch()}
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
