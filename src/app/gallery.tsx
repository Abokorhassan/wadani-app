import { Inbox, Send } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PasswordField,
  PhoneField,
  Screen,
  SegmentedTabs,
  SelectField,
  Skeleton,
  StatusPill,
  StepIndicator,
  Text,
  TextField,
  useTheme,
  useToast,
  type StatusTone,
  type TypographyVariant,
} from '@/design-system';

/** Dev-only reference for every component in every state (build-plan Phase 0). */
export default function GalleryScreen() {
  const theme = useTheme();
  const toast = useToast();

  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<string>();
  const [tab, setTab] = useState('news');
  const [step, setStep] = useState(1);

  const variants: TypographyVariant[] = [
    'display',
    'title',
    'heading',
    'body',
    'bodyStrong',
    'small',
    'smallStrong',
    'caption',
    'overline',
    'mono',
  ];

  const swatches: { name: string; color: string; onColor: string }[] = [
    { name: 'brand', color: theme.color.brand, onColor: theme.color.textOnBrand },
    { name: 'brandDark', color: theme.color.brandDark, onColor: theme.color.textOnBrand },
    { name: 'action', color: theme.color.action, onColor: theme.color.textOnAction },
    { name: 'accent', color: theme.color.accent, onColor: theme.color.textOnAction },
    { name: 'surfaceWarm', color: theme.color.surfaceWarm, onColor: theme.color.text },
    { name: 'danger', color: theme.color.danger, onColor: theme.color.textOnAction },
  ];

  const tones: StatusTone[] = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'];

  return (
    <Screen>
      <Section title="Colour">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {swatches.map((swatch) => (
            <View
              key={swatch.name}
              style={{
                backgroundColor: swatch.color,
                borderRadius: theme.radius.md,
                paddingVertical: theme.spacing.lg,
                paddingHorizontal: theme.spacing.md,
                minWidth: 104,
              }}>
              <Text variant="caption" style={{ color: swatch.onColor }}>
                {swatch.name}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Type scale">
        {variants.map((variant) => (
          <Text key={variant} variant={variant} style={{ marginBottom: theme.spacing.xs }}>
            {variant} — Xisbiga Waddani
          </Text>
        ))}
      </Section>

      <Section title="Buttons">
        <View style={{ gap: theme.spacing.sm }}>
          <Button label="Primary" onPress={() => toast.show('Primary pressed')} />
          <Button label="Secondary" variant="secondary" />
          <Button label="Ghost" variant="ghost" />
          <Button label="Danger" variant="danger" />
          <Button label="Loading" loading />
          <Button label="Disabled" disabled />
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button label="Small" size="sm" block={false} />
            <Button label="With icon" size="sm" icon={Send} block={false} variant="secondary" />
          </View>
        </View>
      </Section>

      <Section title="Inputs">
        <TextField
          label="Full name"
          value={text}
          onChangeText={setText}
          placeholder="e.g. Amina Yusuf"
          hint="As it appears on your ID"
        />
        <TextField
          label="Email"
          value="not-an-email"
          error="Enter a valid email address."
          onChangeText={() => {}}
        />
        <PasswordField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
        />
        <PhoneField label="Phone" value="" onChangeText={() => {}} />
        <SelectField
          label="Membership plan"
          value={plan}
          onChange={setPlan}
          placeholder="Select a plan"
          options={[
            { value: 'standard', label: 'Standard', description: '$25 / year' },
            { value: 'silver', label: 'Silver', description: '$50 / year' },
            { value: 'gold', label: 'Gold', description: '$100 / year' },
          ]}
        />
      </Section>

      <Section title="Navigation">
        <SegmentedTabs
          items={[
            { key: 'news', label: 'News' },
            { key: 'events', label: 'Events' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <View style={{ marginTop: theme.spacing.xl }}>
          <StepIndicator
            steps={['Personal', 'Address', 'Plan', 'Payment']}
            current={step}
            onStepPress={setStep}
          />
        </View>
        <Button
          label="Advance step"
          variant="ghost"
          onPress={() => setStep((value) => (value + 1) % 4)}
          style={{ marginTop: theme.spacing.lg }}
        />
      </Section>

      <Section title="Status">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {tones.map((tone) => (
            <StatusPill key={tone} label={tone} tone={tone} />
          ))}
        </View>
      </Section>

      <Section title="Avatar">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Avatar name="Mohamed Shibbin" size={40} />
          <Avatar name="Faduma Shibbin" size={56} />
          <Avatar name="Waddani Member" size={72} ringColor={theme.color.brand} />
        </View>
      </Section>

      <Section title="Cards">
        <View style={{ gap: theme.spacing.sm }}>
          <Card>
            <Text variant="bodyStrong">Surface card</Text>
          </Card>
          <Card tone="warm">
            <Text variant="bodyStrong">Warm card</Text>
          </Card>
          <Card tone="brandTint" onPress={() => toast.show('Card pressed', 'success')}>
            <Text variant="bodyStrong">Tinted, pressable</Text>
          </Card>
        </View>
      </Section>

      <Section title="Feedback">
        <View style={{ gap: theme.spacing.md }}>
          <Skeleton width="60%" height={20} />
          <Skeleton height={64} radius={theme.radius.lg} />
          <ErrorState onRetry={() => toast.show('Retrying…')} />
          <EmptyState
            icon={Inbox}
            title="No payments yet"
            message="Payments appear here once your membership is approved."
            actionLabel="Refresh"
            onAction={() => toast.show('Refreshed')}
          />
          <Button
            label="Show error toast"
            variant="secondary"
            onPress={() => toast.show('Could not save', 'danger')}
          />
        </View>
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.spacing.xl }}>
      <Text variant="overline" color="textMuted" style={{ marginBottom: theme.spacing.md }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
