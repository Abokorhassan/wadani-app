import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { asApiError, isApiError, serverMessage } from '@/api/errors';
import {
  Button,
  PhoneField,
  Screen,
  ScreenHeader,
  Text,
  TextField,
  useTheme,
  useToast,
} from '@/design-system';
import {
  DONATION_PRESETS,
  parseAmount,
  useCreateDonation,
  type Donation,
} from '@/features/donations';
import {
  isWalletMethod,
  PAYMENT_METHODS,
  PaymentMethodPicker,
  useCardCheckout,
  type ChargeMethod,
} from '@/features/payments';
import { formatUsd } from '@/lib/format';
import { toInternationalPhone } from '@/lib/phone';

export default function DonateScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const createDonation = useCreateDonation();
  const runCardCheckout = useCardCheckout();

  const [amount, setAmount] = useState('25.00');
  const [method, setMethod] = useState<ChargeMethod>('WAAFI');
  const [payerPhone, setPayerPhone] = useState('');
  const [error, setError] = useState<string>();
  const [phoneError, setPhoneError] = useState<string>();
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
    if (isWalletMethod(method)) {
      if (!payerPhone.trim()) {
        setPhoneError(t('donate.payerPhoneRequired'));
        return;
      }
      if (toInternationalPhone(payerPhone) === null) {
        setPhoneError(t('donate.payerPhoneInvalid'));
        return;
      }
    }
    setError(undefined);
    setPhoneError(undefined);

    createDonation.mutate(
      { amountUsd, method, payerPhone: payerPhone.trim() || undefined },
      {
        onSuccess: (result) => {
          if (result.kind === 'donated') {
            setDone(result.donation);
            return;
          }
          // A card donation is only recorded once the payment is confirmed.
          void runCardCheckout(result.checkout).then((outcome) => {
            if (outcome.status === 'cancelled') {
              toast.show(t('checkout.cancelled'), 'danger');
              return;
            }
            if (outcome.status === 'failed') {
              toast.show(t(`checkout.${outcome.reason}`), 'danger');
              return;
            }
            setDone({
              id: result.checkout.checkoutId,
              amountUsd,
              currency: 'USD',
              method,
              donatedAt: new Date().toISOString(),
            });
          });
        },
        onError: (error) => {
          const details = isApiError(error) ? asApiError(error) : null;
          toast.show((details && serverMessage(details)) ?? t('donate.failed'), 'danger');
        },
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
          <PaymentMethodPicker value={method} onChange={setMethod} />
        </View>

        {isWalletMethod(method) ? (
          <PhoneField
            label={t('donate.payerPhone')}
            hint={t('donate.payerPhoneHint')}
            value={payerPhone}
            onChangeText={setPayerPhone}
            error={phoneError}
          />
        ) : null}

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

/** The charge has already gone through Sifalo by the time this shows. */
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
          {t('donate.thanksText', { amount, method })}
        </Text>
        <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 12 }}>
          <Button label={t('donate.done')} onPress={() => router.back()} />
          <Button label={t('donate.another')} variant="secondary" onPress={onAgain} />
        </View>
      </View>
    </Screen>
  );
}
