import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { asApiError, isApiError, serverMessage } from '@/api/errors';
import {
  Button,
  IconButton,
  Screen,
  StepIndicator,
  Text,
  useTheme,
  useToast,
} from '@/design-system';
import {
  useEmailExists,
  useFinishCardRegistration,
  useRegister,
  type RegistrationPayload,
} from '@/features/auth';
import { usePlans, type EducationLevel, type Gender } from '@/features/membership';
import { isWalletMethod, useCardCheckout, type ChargeMethod } from '@/features/payments';
import {
  AddressStep,
  describeFormErrors,
  draftDefaults,
  emptyRegistration,
  formFieldFor,
  quoteFor,
  PaymentStep,
  PersonalStep,
  PlanStep,
  registrationResolver,
  STEP_COUNT,
  STEP_FIELDS,
  STEP_NAME_KEYS,
  stepForField,
  uploadMemberPhoto,
  useDraftStore,
  PhotoUploadUnavailableError,
  type RegistrationForm,
} from '@/features/registration';
import { formatUsd } from '@/lib/format';
import { toInternationalPhone } from '@/lib/phone';

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
  // Why the last submit failed. Kept on the payment step rather than moving the
  // member back to the field's own step (build-plan D7, revised 2026-09-23).
  const [submitError, setSubmitError] = useState<string | null>(null);
  const register = useRegister();
  const finishCardRegistration = useFinishCardRegistration();
  const runCardCheckout = useCardCheckout();
  const plans = usePlans();
  const emailExists = useEmailExists();

  const form = useForm<RegistrationForm>({
    defaultValues: draft ? draftDefaults(draft) : emptyRegistration,
    resolver: registrationResolver,
    mode: 'onBlur',
  });

  // react-hook-form isn't compatible with the React Compiler, so this screen
  // is left uncompiled rather than restructured around it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = form.watch();
  const plan = plans.data?.find((candidate) => candidate.id === values.planId);
  // What gets charged, or null until the amount and months are both valid.
  const quote = quoteFor(plan, values.amount, values.months);

  /**
   * Flags the email under its field when another member already uses it, and
   * says whether it did. Silent when the server cannot be asked: registration
   * itself still refuses a duplicate.
   */
  const emailIsTaken = async (): Promise<boolean> => {
    const email = form.getValues('email')?.trim();
    if (!email || form.getFieldState('email').invalid) return false;
    const taken = await emailExists(email);
    if (taken) form.setError('email', { message: t('register.emailTaken') });
    return taken === true;
  };

  const goTo = (next: number) => {
    saveDraft(form.getValues(), next);
    setStep(next);
  };

  /**
   * Checks one step: its own fields, plus what only this screen can know because
   * it depends on server data. Everything is reported together, so a member sees
   * every problem at once instead of fixing them one tap at a time.
   */
  const validateStep = async (index: number): Promise<boolean> => {
    let ok = await form.trigger(STEP_FIELDS[index]);

    // The email is unique, so a clash is caught here, not after the payment step.
    if (index === 0 && (await emailIsTaken())) ok = false;

    // A plan saved in a draft, or not loaded yet, may not exist on the server,
    // and registering with an unknown id is rejected outright.
    if (index === 2 && !plan) {
      form.setError('planId', { message: t('register.planUnavailable') });
      ok = false;
    }

    // The field that failed can be scrolled out of sight, so say so here too.
    if (!ok) toast.show(t('register.fixErrors'), 'danger');
    return ok;
  };

  const onNext = async () => {
    if (!(await validateStep(step))) return;

    if (step < STEP_COUNT - 1) {
      goTo(step + 1);
      return;
    }
    await submit();
  };

  const submit = async () => {
    setSubmitError(null);

    // Next validates one step at a time, but the step tabs (StepIndicator) can
    // jump straight to Payment with no validation at all, so submit has to
    // check the whole form regardless of how the member got here -- otherwise
    // a field edited on an earlier step and never revisited sails through.
    if (!(await form.trigger())) {
      setSubmitError(describeFormErrors(form.formState.errors, step, t));
      return;
    }

    // The step tabs can skip past the personal step's own check, so ask again.
    if (await emailIsTaken()) {
      setSubmitError(
        `${t('register.emailTaken')} ${t('register.fixOnStep', { step: t('register.steps.personal') })}`
      );
      return;
    }

    const values = form.getValues();
    const method = values.method as ChargeMethod;
    // The whole form is valid, so the plan and months are known.
    if (!quote) {
      setSubmitError(t('register.planUnavailable'));
      return;
    }

    let photoUrl: string;
    try {
      setUploading(true);
      photoUrl = await uploadMemberPhoto(values.photoUri);
    } catch (error) {
      const message =
        error instanceof PhotoUploadUnavailableError
          ? t('register.photoUploadUnavailable')
          : t('register.photoUploadFailed');
      // Flagged on the photo itself for when they go back, and said plainly here.
      form.setError('photoUri', { message });
      setSubmitError(
        `${message} ${t('register.fixOnStep', { step: t('register.steps.personal') })}`
      );
      return;
    } finally {
      setUploading(false);
    }

    const payload: RegistrationPayload = {
      fullName: values.fullName.trim(),
      gender: values.gender as Gender,
      phone: toInternationalPhone(values.phone) ?? values.phone.trim(),
      whatsapp: values.whatsapp
        ? (toInternationalPhone(values.whatsapp) ?? values.whatsapp.trim())
        : undefined,
      email: values.email?.trim() || undefined,
      photoUrl,
      education: values.education as EducationLevel,
      professionalWork: values.professionalWork.trim(),
      birthYear: Number(values.birthYear),
      membershipTypeId: values.planId,
      membershipMonths: quote.months,
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
        amountUsd: quote.totalUsd,
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
        // Nothing exists yet: the member is created when the card payment is confirmed.
        void runCardCheckout(result.checkout).then((outcome) => {
          // Same rule as a refused charge: explain it where they are.
          if (outcome.status === 'cancelled') {
            setSubmitError(t('checkout.cancelled'));
            return;
          }
          if (outcome.status === 'failed') {
            setSubmitError(t(`checkout.${outcome.reason}`));
            return;
          }
          // Paid: the member now exists, so the draft goes whatever happens next.
          clearDraft();
          finishCardRegistration.mutate(
            {
              credentials: { identifier: payload.phone, password: payload.password },
              confirmed: outcome.result,
            },
            {
              onSuccess: () => router.replace('/home'),
              // The account exists and is paid for; only the automatic sign-in failed.
              onError: () => {
                toast.show(t('checkout.paidSignIn'), 'success');
                router.replace('/login');
              },
            }
          );
        });
      },
      onError: (error) => {
        const details = isApiError(error) ? asApiError(error) : null;

        // The payment was refused, not the form: the gateway's own wording names
        // the real problem, such as a wallet the chosen method cannot reach.
        if (details?.kind === 'declined') {
          setSubmitError(serverMessage(details) ?? t('register.declined'));
          return;
        }

        // A field error is flagged on its own field, so it is visible if the
        // member goes back, but they are not moved there: the explanation
        // belongs where they pressed the button (D7, revised 2026-09-23).
        if (details?.kind === 'validation' && Object.keys(details.fieldErrors).length > 0) {
          const [field, message] = Object.entries(details.fieldErrors)[0];
          const formField = formFieldFor(field);
          const text = serverMessage(details) ?? message;
          if (formField) {
            form.setError(formField, { message });
            const stepIndex = stepForField(field);
            setSubmitError(
              stepIndex === step
                ? text
                : `${text} ${t('register.fixOnStep', { step: t(STEP_NAME_KEYS[stepIndex]) })}`
            );
            return;
          }
          setSubmitError(text);
          return;
        }

        setSubmitError((details && serverMessage(details)) ?? t('register.failed'));
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

  /*
   * The last button names what it does. Pressing it takes money, so it says so
   * and shows the sum; a card opens a checkout page first, so it says that
   * instead of promising a charge.
   */
  const lastStep = step === STEP_COUNT - 1;
  const paysByCard = values.method === 'CARD';
  const primaryLabel = !lastStep
    ? t('common.next')
    : paysByCard || !quote
      ? t('register.submitCard')
      : t('register.submit', { amount: formatUsd(quote.totalUsd) });

  const total = quote
    ? {
        amount: formatUsd(quote.totalUsd),
        formula: t('register.totalFormula', {
          price: formatUsd(quote.monthlyUsd),
          months: t('register.monthsUnit', { count: quote.months }),
        }),
      }
    : undefined;

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing.lg }}>
          {/* The one thing about a wallet payment that surprises people. */}
          {lastStep && !paysByCard ? (
            <Text variant="caption" color="textMuted" center>
              {t('register.payHint')}
            </Text>
          ) : null}
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
              label={primaryLabel}
              iconRight={lastStep ? undefined : ArrowRight}
              loading={register.isPending || uploading || finishCardRegistration.isPending}
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
        {step === 0 ? (
          <PersonalStep
            control={form.control}
            // After the field's own validation, which would otherwise clear the flag.
            onEmailBlur={() => void form.trigger('email').then((ok) => ok && emailIsTaken())}
          />
        ) : null}
        {step === 1 ? <AddressStep control={form.control} /> : null}
        {step === 2 ? (
          <PlanStep
            control={form.control}
            planId={values.planId}
            amount={values.amount}
            months={values.months}
            setValue={form.setValue}
          />
        ) : null}
        {step === 3 ? (
          <PaymentStep
            control={form.control}
            total={total}
            wallet={isWalletMethod(values.method as ChargeMethod)}
            submitError={submitError}
          />
        ) : null}
      </View>
    </Screen>
  );
}
