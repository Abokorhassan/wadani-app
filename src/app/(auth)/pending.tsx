import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check, Hourglass, MessageCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Screen, Text, useTheme } from '@/design-system';
import { useSessionStore } from '@/features/auth';
import { openWhatsApp, useContactInfo } from '@/features/support';

const sealColor = require('@/assets/brand/seal-color.png');

type StepState = 'done' | 'now' | 'next';

export default function PendingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const signOut = useSessionStore((state) => state.signOut);
  const contact = useContactInfo();

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', paddingTop: theme.spacing.xxl }}>
        <View
          style={{
            width: 136,
            height: 136,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.surface,
          }}>
          <Image source={sealColor} style={{ width: 96, height: 96 }} />
          <View
            style={{
              position: 'absolute',
              right: -4,
              bottom: 2,
              width: 48,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.pill,
              borderWidth: 4,
              borderColor: theme.color.background,
              backgroundColor: theme.color.warningTint,
            }}>
            <Hourglass size={20} color={theme.color.warning} />
          </View>
        </View>

        <Text
          variant="title"
          center
          style={{ marginTop: theme.spacing.xl, fontSize: 30, lineHeight: 35 }}>
          {t('pending.title')}
        </Text>
        <Text variant="body" color="textMuted" center style={{ marginTop: theme.spacing.md }}>
          {t('pending.body')}
        </Text>
      </View>

      <View
        style={{
          marginTop: theme.spacing.xl,
          padding: theme.spacing.gutter,
          borderRadius: theme.radius.card,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.surface,
        }}>
        <Timeline state="done" title={t('pending.stepSubmitted')} />
        <Timeline state="now" title={t('pending.stepReview')} note={t('pending.stepReviewNote')} />
        <Timeline
          state="next"
          title={t('pending.stepApproved')}
          note={t('pending.stepApprovedNote')}
          last
        />
      </View>

      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
        {contact.data ? (
          <Button
            label={t('pending.contactUs')}
            variant="secondary"
            icon={MessageCircle}
            onPress={() =>
              void openWhatsApp(contact.data.whatsappNumber, t('contact.whatsappMessage'))
            }
          />
        ) : null}
        <Button
          label={t('pending.backToStart')}
          variant="secondary"
          onPress={() => {
            void signOut();
            router.replace('/welcome');
          }}
        />
      </View>
    </Screen>
  );
}

function Timeline({
  state,
  title,
  note,
  last = false,
}: {
  state: StepState;
  title: string;
  note?: string;
  last?: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 26,
            height: 26,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 13,
            borderWidth: state === 'done' ? 0 : 2,
            borderColor: state === 'now' ? theme.color.brand : theme.color.borderStrong,
            backgroundColor:
              state === 'done'
                ? theme.color.action
                : state === 'now'
                  ? theme.color.brandTint
                  : theme.color.surface,
          }}>
          {state === 'done' ? (
            <Check size={14} color={theme.color.textOnAction} strokeWidth={3} />
          ) : null}
          {state === 'now' ? (
            <View
              style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.color.brand }}
            />
          ) : null}
        </View>
        {last ? null : (
          <View
            style={{
              flex: 1,
              width: 2,
              minHeight: 20,
              marginVertical: 4,
              backgroundColor: state === 'done' ? theme.color.action : theme.color.borderStrong,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, gap: 2, paddingTop: 3, paddingBottom: last ? 0 : 16 }}>
        <Text variant="smallStrong" color={state === 'next' ? 'textMuted' : 'text'}>
          {title}
        </Text>
        {note ? (
          <Text variant="caption" color="textMuted">
            {note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
