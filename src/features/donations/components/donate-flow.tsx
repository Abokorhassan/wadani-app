import { useRouter } from 'expo-router';
import { Heart, UserPlus } from 'lucide-react-native';
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
  isWalletMethod,
  PAYMENT_METHODS,
  PaymentMethodPicker,
  useCardCheckout,
  type ChargeMethod,
} from '@/features/payments';
import { formatUsd } from '@/lib/format';
import { toInternationalPhone } from '@/lib/phone';

import { useCreateDonation, useCreateGuestDonation } from '../hooks';
import { parseAmount } from '../mappers';
import { DONATION_PRESETS, type Donation, type DonationResult } from '../types';

type Errors = { amount?: string; fullName?: string; phone?: string; payerPhone?: string };

/**
 * The donate form and its thank-you screen. A member donates on their account;
 * a guest (`guest`) gives their name and phone instead and needs no account
 * (POST /mobile/donations).
 */
export function DonateFlow({ guest = false }: { guest?: boolean }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const memberDonation = useCreateDonation();
  const guestDonation = useCreateGuestDonation();
  const runCardCheckout = useCardCheckout();

  const [amount, setAmount] = useState('25.00');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<ChargeMethod>('WAAFI');
  const [payerPhone, setPayerPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<Donation>();

  if (done) {
    return <DonationThanks donation={done} guest={guest} onAgain={() => setDone(undefined)} />;
  }

  const clear = (field: keyof Errors) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  const submit = () => {
    const next: Errors = {};
    const amountUsd = parseAmount(amount);
    if (amountUsd === null) next.amount = t('donate.invalidAmount');
    if (guest) {
      if (!fullName.trim()) next.fullName = t('donate.fullNameRequired');
      if (!phone.trim()) next.phone = t('donate.phoneRequired');
      else if (toInternationalPhone(phone) === null) next.phone = t('donate.phoneInvalid');
    }
    // A guest who leaves the wallet empty pays from their own phone.
    const wallet = payerPhone.trim() || (guest ? phone.trim() : '');
    if (isWalletMethod(method) && !next.phone) {
      if (!wallet) next.payerPhone = t('donate.payerPhoneRequired');
      else if (toInternationalPhone(wallet) === null)
        next.payerPhone = t('donate.payerPhoneInvalid');
    }
    setErrors(next);
    if (amountUsd === null || Object.keys(next).length > 0) return;

    const charge = { amountUsd, method, payerPhone: wallet || undefined };
    const onSuccess = (result: DonationResult) => {
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
    };
    const onError = (error: Error) => {
      const details = isApiError(error) ? asApiError(error) : null;
      toast.show((details && serverMessage(details)) ?? t('donate.failed'), 'danger');
    };

    if (guest) {
      guestDonation.mutate(
        { ...charge, fullName: fullName.trim(), phone: phone.trim() },
        { onSuccess, onError }
      );
    } else {
      memberDonation.mutate(charge, { onSuccess, onError });
    }
  };

  return (
    <Screen>
      <ScreenHeader
        back
        title={t('donate.title')}
        subtitle={guest ? t('donate.guestSubtitle') : t('donate.subtitle')}
      />

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
              clear('amount');
            }}
            keyboardType="decimal-pad"
            prefix="$"
            error={errors.amount}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {DONATION_PRESETS.map((preset) => {
              const selected = parseAmount(amount) === preset;
              return (
                <Pressable
                  key={preset}
                  onPress={() => {
                    setAmount(preset.toFixed(2));
                    clear('amount');
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

        {guest ? (
          <View style={{ gap: 14 }}>
            <Text variant="label" color="textSecondary">
              {t('donate.yourDetails')}
            </Text>
            <TextField
              label={t('donate.fullName')}
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                clear('fullName');
              }}
              placeholder={t('register.fullNamePlaceholder')}
              autoCapitalize="words"
              error={errors.fullName}
            />
            <PhoneField
              label={t('donate.phone')}
              value={phone}
              onChangeText={(value) => {
                setPhone(value);
                clear('phone');
              }}
              error={errors.phone}
            />
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <Text variant="label" color="textSecondary">
            {t('donate.method')}
          </Text>
          <PaymentMethodPicker value={method} onChange={setMethod} />
        </View>

        {isWalletMethod(method) ? (
          <PhoneField
            label={t('donate.payerPhone')}
            hint={guest ? t('donate.payerPhoneGuestHint') : t('donate.payerPhoneHint')}
            optional={guest ? t('common.optional') : undefined}
            value={payerPhone}
            onChangeText={(value) => {
              setPayerPhone(value);
              clear('payerPhone');
            }}
            error={errors.payerPhone}
          />
        ) : null}

        <Button
          label={t('donate.submit')}
          icon={Heart}
          onPress={submit}
          loading={memberDonation.isPending || guestDonation.isPending}
        />
      </View>
    </Screen>
  );
}

/** The charge has already gone through Sifalo by the time this shows. */
function DonationThanks({
  donation,
  guest,
  onAgain,
}: {
  donation: Donation;
  guest: boolean;
  onAgain: () => void;
}) {
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
          {guest ? (
            // Someone who just gave is the likeliest person to join.
            <Button
              label={t('donate.becomeMember')}
              icon={UserPlus}
              onPress={() => router.replace('/register')}
            />
          ) : null}
          <Button
            label={guest ? t('donate.backToStart') : t('donate.done')}
            variant={guest ? 'secondary' : 'primary'}
            onPress={() => router.back()}
          />
          <Button label={t('donate.another')} variant="secondary" onPress={onAgain} />
        </View>
      </View>
    </Screen>
  );
}
