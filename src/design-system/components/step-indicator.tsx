import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './text';

export interface StepIndicatorProps {
  steps: string[];
  current: number;
  /** Only completed steps are tappable (build-plan D6). */
  onStepPress?: (index: number) => void;
}

/** Segmented progress bar with labels: done = green, current = orange. */
export function StepIndicator({ steps, current, onStepPress }: StepIndicatorProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: steps.length, now: current + 1 }}
      style={{ flexDirection: 'row', gap: 6 }}>
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const tappable = done && Boolean(onStepPress);

        return (
          <Pressable
            key={label}
            disabled={!tappable}
            onPress={() => onStepPress?.(index)}
            accessibilityRole={tappable ? 'button' : undefined}
            accessibilityLabel={`Step ${index + 1}: ${label}`}
            style={{ flex: 1, gap: theme.spacing.sm }}>
            <View
              style={{
                height: 5,
                borderRadius: theme.radius.pill,
                backgroundColor: done
                  ? theme.color.action
                  : active
                    ? theme.color.brand
                    : theme.color.borderStrong,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {done ? <Check size={13} color={theme.color.actionDeep} strokeWidth={3} /> : null}
              <Text
                variant="captionStrong"
                numberOfLines={1}
                color={done ? 'actionDeep' : active ? 'text' : 'textMuted'}
                style={active ? { fontFamily: theme.fonts.text700 } : null}>
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
