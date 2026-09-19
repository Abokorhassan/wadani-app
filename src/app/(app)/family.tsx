import { Plus, Users } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, View } from 'react-native';

import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  Screen,
  ScreenHeader,
  Skeleton,
  StatusPill,
  Text,
  TextField,
  useTheme,
  useToast,
  type StatusTone,
} from '@/design-system';
import {
  RELATIONS,
  useAddFamilyMember,
  useFamily,
  type FamilyMember,
  type FamilyMemberStatus,
  type Relation,
} from '@/features/family';

const STATUS_TONE: Record<FamilyMemberStatus, StatusTone> = {
  active: 'success',
  pending: 'warning',
  rejected: 'danger',
};

export default function FamilyScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const family = useFamily();
  const addMember = useAddFamilyMember();

  const [name, setName] = useState('');
  const [relation, setRelation] = useState<Relation>('child');
  const [error, setError] = useState<string>();

  const submit = () => {
    const fullName = name.trim();
    if (!fullName) {
      setError(t('family.nameRequired'));
      return;
    }
    setError(undefined);
    addMember.mutate(
      { fullName, relation },
      {
        onSuccess: (member) => {
          setName('');
          toast.show(t('family.added', { name: member.fullName }), 'success');
        },
        onError: () => toast.show(t('family.addFailed'), 'danger'),
      }
    );
  };

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={family.isRefetching}
          onRefresh={() => void family.refetch()}
          tintColor={theme.color.brand}
        />
      }>
      <ScreenHeader back title={t('family.title')} subtitle={t('family.subtitle')} />

      <View style={{ marginTop: 22 }}>
        {family.isPending ? (
          <Skeleton height={230} radius={theme.radius.card} />
        ) : family.isError ? (
          <ErrorState
            message={t('family.loadFailed')}
            onRetry={() => void family.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : family.data.length === 0 ? (
          <EmptyState icon={Users} title={t('family.emptyTitle')} message={t('family.emptyText')} />
        ) : (
          <View
            style={{
              borderRadius: theme.radius.card,
              borderWidth: 1,
              borderColor: theme.color.border,
              backgroundColor: theme.color.surface,
            }}>
            {family.data.map((member, index) => (
              <MemberRow key={member.id} member={member} last={index === family.data.length - 1} />
            ))}
          </View>
        )}
      </View>

      {/* Add form */}
      <View
        style={{
          gap: 18,
          marginTop: 16,
          padding: 20,
          borderRadius: theme.radius.hero,
          backgroundColor: theme.color.surfaceWarm,
        }}>
        <Text variant="headline">{t('family.addTitle')}</Text>

        <TextField
          label={t('family.fullName')}
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (error) setError(undefined);
          }}
          placeholder={t('family.namePlaceholder')}
          error={error}
          autoCapitalize="words"
        />

        <View style={{ gap: 10 }}>
          <Text variant="label" color="textSecondary">
            {t('family.relation')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {RELATIONS.map((option) => {
              const selected = option === relation;
              return (
                <Pressable
                  key={option}
                  onPress={() => setRelation(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={t(`relations.${option}`)}
                  style={{
                    height: theme.controlHeight.chip,
                    justifyContent: 'center',
                    paddingHorizontal: 18,
                    borderRadius: theme.radius.pill,
                    borderWidth: 1.5,
                    borderColor: selected ? theme.color.surfaceInk : theme.color.borderStrong,
                    backgroundColor: selected ? theme.color.surfaceInk : theme.color.surface,
                  }}>
                  <Text variant="smallStrong" color={selected ? 'textOnInk' : 'text'}>
                    {t(`relations.${option}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          label={t('family.add')}
          icon={Plus}
          onPress={submit}
          loading={addMember.isPending}
        />
      </View>
    </Screen>
  );
}

function MemberRow({ member, last }: { member: FamilyMember; last: boolean }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const detail = [
    t(`relations.${member.relation}`),
    member.memberId ?? t('family.awaitingApproval'),
  ].join(' · ');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.color.border,
      }}>
      <Avatar
        name={member.fullName}
        size={46}
        tone={member.status === 'active' ? 'warm' : 'brand'}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{member.fullName}</Text>
        <Text variant="caption" color="textMuted">
          {detail}
        </Text>
      </View>
      <StatusPill label={t(`status.${member.status}`)} tone={STATUS_TONE[member.status]} />
    </View>
  );
}
