import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { asApiError, isApiError } from '@/api/errors';
import {
  Button,
  IconButton,
  Screen,
  StepIndicator,
  Text,
  useTheme,
  useToast,
} from '@/design-system';
import { useRegister, type RegistrationPayload } from '@/features/auth';
import {
  priceFor,
  usePeriods,
  usePlans,
  type EducationLevel,
  type Gender,
} from '@/features/membership';
import { isWalletMethod, useCardCheckout, type ChargeMethod } from '@/features/payments';
import {
  AddressStep,
  draftDefaults,
  formFieldFor,
  PaymentStep,
  PersonalStep,
  PlanStep,
  registrationSchema,
  STEP_COUNT,
  STEP_FIELDS,
  stepForField,
  uploadMemberPhoto,
  useDraftStore,
  PhotoUploadUnavailableError,
  type RegistrationForm,
} from '@/features/registration';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();

  const draft = useRef(useDraftStore.getState().draft).current;
  const saveDraft = useDraftStore((state) => state.save);
  const clearDraft = useDraftStore((state) => state.clear);

  const [step, setStep] = useState(draft?.step ?? 0);
  const [uploading, setUploading] = useState(false);
  const register = useRegister();
  const runCardCheckout = useCardCheckout();
  const plans = usePlans();
  const periods = usePeriods();

  const form = useForm<RegistrationForm>({
    defaultValues: draftDefaults(draft),
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
  });

  // react-hook-form isn't compatible with the React Compiler, so this screen
  // is left uncompiled rather than restructured around it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = form.watch();
  const plan = plans.data?.find((candidate) => candidate.id === values.planId);
  const period = periods.data?.find((candidate) => candidate.id === values.periodId);

  const goTo = (next: number) => {
    saveDraft(form.getValues(), next);
    setStep(next);
  };

  const onNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;

    // Leaving the plan step sets what this plan and period cost (D5). It is
    // recomputed rather than only filled when blank: the backend charges the
    // amount as sent without checking it against the plan, so a figure left
    // over from an earlier choice would bill the member the wrong sum.
    if (step === 2 && plan && period) {
      form.setValue('amount', priceFor(plan, period).toFixed(2));
    }
    if (step < STEP_COUNT - 1) {
      goTo(step + 1);
      return;
    }
    await submit();
  };

  const submit = async () => {
    const values = form.getValues();
    const method = values.method as ChargeMethod;

    // The backend requires a reachable photo URL, and the app has nowhere to
    // upload one yet (docs/api-gaps.md, question 3).
    if (!values.photoUri) {
      form.setError('photoUri', { message: t('register.photoRequired') });
      setStep(0);
      return;
    }

    let photoUrl: string;
    try {
      setUploading(true);
      photoUrl = await uploadMemberPhoto(values.photoUri);
    } catch (error) {
      setStep(0);
      form.setError('photoUri', {
        message:
          error instanceof PhotoUploadUnavailableError
            ? t('register.photoUploadUnavailable')
            : t('register.photoUploadFailed'),
      });
      return;
    } finally {
      setUploading(false);
    }

    const payload: RegistrationPayload = {
      fullName: values.fullName.trim(),
      gender: values.gender as Gender,
      phone: values.phone.trim(),
      whatsapp: values.whatsapp?.trim() || undefined,
      email: values.email?.trim() || undefined,
      photoUrl,
      education: values.education as EducationLevel,
      professionalWork: values.professionalWork.trim(),
      birthYear: Number(values.birthYear),
      membershipTypeId: values.planId,
      membershipPeriodId: values.periodId,
      address: {
        line1: values.line1.trim(),
        city: values.city.trim(),
        region: values.region.trim(),
        country: values.country.trim(),
        district: values.district?.trim() || undefined,
      },
      password: values.password,
      charge: {
        method,
        amountUsd: Number(values.amount.replace(/[^0-9.]/g, '')),
        payerPhone: values.payerPhone?.trim() || undefined,
      },
    };

    register.mutate(payload, {
      onSuccess: (result) => {
        if (result.kind === 'registered') {
          clearDraft();
          router.replace('/home');
          return;
        }
        // Nothing exists yet: the member is created when the card clears.
        runCardCheckout(result.checkout)
          .then(() => {
            clearDraft();
            router.replace('/home');
          })
          .catch(() => toast.show(t('register.failed'), 'danger'));
      },
      onError: (error) => {
        // Field errors from the backend land on their own field, and the
        // wizard jumps back to the step holding it (build-plan D7).
        const details = isApiError(error) ? asApiError(error) : null;
        if (details?.kind === 'validation' && Object.keys(details.fieldErrors).length > 0) {
          const [field, message] = Object.entries(details.fieldErrors)[0];
          const formField = formFieldFor(field);
          if (formField) form.setError(formField, { message });
          setStep(stepForField(field));
          return;
        }
        toast.show(t('register.failed'), 'danger');
      },
    });
  };

  const leave = () => {
    if (step === 0 && !form.formState.isDirty) {
      router.back();
      return;
    }
    Alert.alert(t('register.discardTitle'), t('register.discardMessage'), [
      { text: t('register.keepEditing'), style: 'cancel' },
      {
        text: t('register.discardConfirm'),
        style: 'destructive',
        onPress: () => {
          clearDraft();
          router.back();
        },
      },
    ]);
  };

  const amountHint =
    plan && period
      ? t('register.amountHint', { plan: plan.name, period: period.label })
      : undefined;

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            {step > 0 ? (
              <Button
                label={t('common.back')}
                variant="secondary"
                icon={ArrowLeft}
                block={false}
                onPress={() => goTo(step - 1)}
                style={{ paddingHorizontal: 18 }}
              />
            ) : null}
            <Button
              label={step === STEP_COUNT - 1 ? t('register.submit') : t('common.next')}
              iconRight={step === STEP_COUNT - 1 ? undefined : ArrowRight}
              loading={register.isPending || uploading}
              onPress={() => void onNext()}
              style={{ flex: 1 }}
            />
          </View>
          {step === 0 ? (
            <Text variant="small" color="textMuted" center>
              {t('register.haveAccount')}{' '}
              <Text
                variant="smallStrong"
                color="actionDeep"
                onPress={() => router.replace('/login')}>
                {t('common.logIn')}
              </Text>
            </Text>
          ) : null}
        </View>
      }>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: theme.spacing.md,
        }}>
        <IconButton icon={ArrowLeft} accessibilityLabel={t('common.back')} onPress={leave} />
        <Text variant="label" color="textMuted">
          {t('register.stepOf', { current: step + 1, total: STEP_COUNT })}
        </Text>
      </View>

      <View style={{ gap: 6, marginTop: 18 }}>
        <Text variant="title">{t('register.title')}</Text>
        <Text variant="subtitle" color="textMuted">
          {t('register.subtitle')}
        </Text>
      </View>

      <View style={{ marginTop: 22 }}>
        <StepIndicator
          steps={[
            t('register.steps.personal'),
            t('register.steps.address'),
            t('register.steps.plan'),
            t('register.steps.payment'),
          ]}
          current={step}
          onStepPress={goTo}
        />
      </View>

      <View style={{ marginTop: 26 }}>
        {step === 0 ? <PersonalStep control={form.control} /> : null}
        {step === 1 ? <AddressStep control={form.control} /> : null}
        {step === 2 ? (
          <PlanStep
            control={form.control}
            planId={values.planId}
            periodId={values.periodId}
            setValue={form.setValue}
          />
        ) : null}
        {step === 3 ? (
          <PaymentStep
            control={form.control}
            amountHint={amountHint}
            wallet={isWalletMethod(values.method as ChargeMethod)}
          />
        ) : null}
      </View>
    </Screen>
  );
}
