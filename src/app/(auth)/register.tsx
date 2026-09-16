import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, StepIndicator, Text, useTheme } from '@/design-system';

const STEPS = ['Personal', 'Address', 'Plan', 'Payment'];

/** Phase 0 shell: the wizard frame only. Phase 1 fills in the steps. */
export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          {step > 0 ? (
            <Button
              label="Back"
              variant="secondary"
              onPress={() => setStep((value) => value - 1)}
              style={{ flex: 1 }}
            />
          ) : null}
          <Button
            label={isLast ? 'Create account & get card' : 'Next'}
            onPress={() => (isLast ? router.replace('/pending') : setStep((value) => value + 1))}
            style={{ flex: 2 }}
          />
        </View>
      }>
      <View style={{ paddingTop: theme.spacing.xl }}>
        <Text variant="title">Create your account</Text>
        <Text variant="small" color="textMuted" style={{ marginTop: theme.spacing.xs }}>
          Join Waddani membership.
        </Text>
      </View>

      <View style={{ marginVertical: theme.spacing.xl }}>
        <StepIndicator steps={STEPS} current={step} onStepPress={setStep} />
      </View>

      <Text variant="heading">{STEPS[step]}</Text>
      <Text variant="small" color="textMuted" style={{ marginTop: theme.spacing.xs }}>
        This step is built in Phase 1.
      </Text>

      <Button
        label="Back to welcome"
        variant="ghost"
        onPress={() => router.back()}
        style={{ marginTop: theme.spacing.xl }}
      />
    </Screen>
  );
}
