import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  FileText,
  KeyRound,
  Languages,
  SunMoon,
  LogOut,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, View } from 'react-native';

import {
  Avatar,
  Button,
  ErrorState,
  IconTile,
  Screen,
  ScreenHeader,
  Skeleton,
  StatusPill,
  Text,
  useTheme,
} from '@/design-system';
import { useSessionStore } from '@/features/auth/session-store';
import {
  isExpired,
  MEMBER_STATUS_TONE,
  PlanBenefitsCard,
  useCard,
  useMe,
  useMyPlan,
  usePlanBadge,
} from '@/features/membership';
import {
  AppearanceSwitch,
  LanguageSwitch,
  openLegalPage,
  SocialLinksCard,
} from '@/features/settings';
import { formatMonthYear } from '@/lib/format';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const member = useMe();
  const card = useCard();
  const myPlan = useMyPlan();
  const signOut = useSessionStore((state) => state.signOut);
  const badgeUrl = usePlanBadge(card.data?.membershipType);

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
    ...(member
      ? [{ label: t('profile.education'), value: t(`education.${member.education}`) }]
      : []),
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
          onRefresh={() => {
            void card.refetch();
            void myPlan.refetch();
          }}
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
            <View>
              <Avatar name={name ?? ''} uri={photoUrl} size={104} />
              {/* The plan's badge, pinned to the photo like a medal. */}
              {badgeUrl ? (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    bottom: -6,
                    width: 44,
                    height: 44,
                    overflow: 'hidden',
                    borderRadius: 22,
                    backgroundColor: theme.color.surface,
                  }}>
                  <Image
                    source={{ uri: badgeUrl }}
                    style={{ flex: 1 }}
                    contentFit="cover"
                    accessibilityLabel={t('register.planBadge', {
                      plan: card.data?.membershipType ?? '',
                    })}
                  />
                </View>
              ) : null}
            </View>
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

          {myPlan.data ? <PlanBenefitsCard plan={myPlan.data} style={{ marginTop: 14 }} /> : null}
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

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          marginTop: 14,
          paddingVertical: 14,
          paddingLeft: 16,
          paddingRight: 12,
          borderRadius: theme.radius.card,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.surface,
        }}>
        <IconTile icon={Languages} tone="brand" size={40} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{t('profile.language')}</Text>
          <Text variant="caption" color="textMuted">
            {t('profile.languageHint')}
          </Text>
        </View>
        <LanguageSwitch icon={false} />
      </View>

      <View
        style={{
          gap: theme.spacing.md,
          marginTop: 14,
          padding: 16,
          borderRadius: theme.radius.card,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.surface,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconTile icon={SunMoon} tone="brand" size={40} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="bodyStrong">{t('profile.appearance')}</Text>
            <Text variant="caption" color="textMuted">
              {t('profile.appearanceHint')}
            </Text>
          </View>
        </View>
        <AppearanceSwitch />
      </View>

      <View
        style={{
          marginTop: 14,
          borderRadius: theme.radius.card,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.surface,
          overflow: 'hidden',
        }}>
        <LinkRow
          icon={KeyRound}
          label={t('profile.changePassword')}
          onPress={() => router.push('/change-password')}
        />
        <View style={{ height: 1, backgroundColor: theme.color.border, marginLeft: 70 }} />
        <LinkRow
          icon={ShieldCheck}
          label={t('profile.privacy')}
          onPress={() => openLegalPage('privacy')}
        />
        <View style={{ height: 1, backgroundColor: theme.color.border, marginLeft: 70 }} />
        <LinkRow
          icon={FileText}
          label={t('profile.terms')}
          onPress={() => openLegalPage('terms')}
        />
        <View style={{ height: 1, backgroundColor: theme.color.border, marginLeft: 70 }} />
        <LinkRow
          icon={Trash2}
          label={t('profile.deleteAccount')}
          hint={t('profile.deleteAccountHint')}
          onPress={() => router.push('/delete-account')}
        />
      </View>

      <SocialLinksCard style={{ marginTop: 14 }} />

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

function LinkRow({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingLeft: 16,
        paddingRight: 12,
        opacity: pressed ? 0.6 : 1,
      })}>
      <IconTile icon={icon} tone="neutral" size={40} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" color="textMuted">
            {hint}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={18} color={theme.color.textMuted} />
    </Pressable>
  );
}
