import { useRouter } from 'expo-router';
import { Check, Heart } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button, Screen, ScreenHeader, Text, TextField, useTheme, useToast } from '@/design-system';
import {
  DONATION_PRESETS,
  parseAmount,
  useCreateDonation,
  type Donation,
} from '@/features/donations';
import { PAYMENT_METHODS, type PaymentMethodId } from '@/features/payments';
import { formatUsd } from '@/lib/format';

const METHOD_IDS = Object.keys(PAYMENT_METHODS) as PaymentMethodId[];

export default function DonateScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const createDonation = useCreateDonation();

  const [amount, setAmount] = useState('25.00');
  const [method, setMethod] = useState<PaymentMethodId>('zaad');
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<Donation>();

  if (done) {
    return <DonationThanks donation={done} onAgain={() => setDone(undefined)} />;
  }

  const submit = () => {
    const amountUsd = parseAmount(amount);
    if (amountUsd === null) {
      setError(t('donate.invalidAmount'));
      return;
    }
    setError(undefined);
    createDonation.mutate(
      { amountUsd, method },
      {
        onSuccess: setDone,
        onError: () => toast.show(t('donate.failed'), 'danger'),
      }
    );
  };

  return (
    <Screen>
      <ScreenHeader back title={t('donate.title')} subtitle={t('donate.subtitle')} />

      <View style={{ gap: 22, marginTop: 22 }}>
        <View
          style={{
            gap: 14,
            padding: 20,
            borderRadius: theme.radius.hero,
            borderWidth: 1,
            borderColor: theme.color.border,
            backgroundColor: theme.color.surface,
          }}>
          <TextField
            label={t('donate.amount')}
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              if (error) setError(undefined);
            }}
            keyboardType="decimal-pad"
            prefix="$"
            error={error}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {DONATION_PRESETS.map((preset) => {
              const selected = parseAmount(amount) === preset;
              return (
                <Pressable
                  key={preset}
                  onPress={() => {
                    setAmount(preset.toFixed(2));
                    setError(undefined);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={formatUsd(preset)}
                  style={{
                    flex: 1,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: theme.radius.md,
                    backgroundColor: selected ? theme.color.surfaceInk : theme.color.surfaceSunken,
                  }}>
                  <Text variant="bodyStrong" color={selected ? 'textOnInk' : 'text'}>
                    ${preset}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text variant="label" color="textSecondary">
            {t('donate.method')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {METHOD_IDS.map((id) => {
              const info = PAYMENT_METHODS[id];
              const selected = id === method;
              const Icon = info.icon;
              return (
                <Pressable
                  key={id}
                  onPress={() => setMethod(id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={info.label}
                  style={{
                    flexBasis: '47%',
                    flexGrow: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    height: theme.controlHeight.field,
                    paddingHorizontal: 14,
                    borderRadius: theme.radius.lg,
                    borderWidth: selected ? 2 : 1.5,
                    borderColor: selected ? theme.color.action : theme.color.border,
                    backgroundColor: selected ? theme.color.actionTint : theme.color.surface,
                  }}>
                  <Icon
                    size={20}
                    color={selected ? theme.color.actionDeep : theme.color.textSecondary}
                  />
                  <Text
                    variant="smallStrong"
                    color={selected ? 'actionDeep' : 'text'}
                    style={{ flex: 1 }}
                    numberOfLines={1}>
                    {info.label}
                  </Text>
                  {selected ? (
                    <Check size={18} color={theme.color.actionDeep} strokeWidth={2.6} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          label={t('donate.submit')}
          icon={Heart}
          onPress={submit}
          loading={createDonation.isPending}
        />
      </View>
    </Screen>
  );
}

/** Manual donations are recorded, not charged, so say what happens next (build-plan D25). */
function DonationThanks({ donation, onAgain }: { donation: Donation; onAgain: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const amount = formatUsd(donation.amountUsd);
  const method = PAYMENT_METHODS[donation.method].label;

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: 16, paddingHorizontal: 8 }}>
        <View
          style={{
            width: 96,
            height: 96,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius.pill,
            backgroundColor: theme.color.actionTint,
          }}>
          <Heart size={40} color={theme.color.actionDeep} />
        </View>
        <Text variant="title" center>
          {t('donate.thanksTitle')}
        </Text>
        <Text variant="body" color="textMuted" center>
          {donation.method === 'cash'
            ? t('donate.thanksCash', { amount })
            : t('donate.thanksText', { amount, method })}
        </Text>
        <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 12 }}>
          <Button label={t('donate.done')} onPress={() => router.back()} />
          <Button label={t('donate.another')} variant="secondary" onPress={onAgain} />
        </View>
      </View>
    </Screen>
  );
}
