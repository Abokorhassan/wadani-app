import { useRouter } from 'expo-router';
import { Hourglass } from 'lucide-react-native';
import { View } from 'react-native';

import { Button, Screen, Text, useTheme } from '@/design-system';

export default function PendingScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen contentStyle={{ justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.color.warningTint,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.xl,
        }}>
        <Hourglass size={32} color={theme.color.warning} />
      </View>

      <Text variant="title" center>
        We&apos;re reviewing your request
      </Text>
      <Text
        variant="small"
        color="textMuted"
        center
        style={{ marginTop: theme.spacing.md, maxWidth: 300 }}>
        Thanks for registering with Waddani. Our team is reviewing your details and payment.
      </Text>
      <Text
        variant="small"
        color="textMuted"
        center
        style={{ marginTop: theme.spacing.sm, maxWidth: 300 }}>
        We will notify you on your WhatsApp and email once your membership is approved.
      </Text>

      <Button
        label="Back to start"
        variant="secondary"
        block={false}
        onPress={() => router.replace('/welcome')}
        style={{ marginTop: theme.spacing.xxl }}
      />
    </Screen>
  );
}
