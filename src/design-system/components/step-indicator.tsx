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

export function StepIndicator({ steps, current, onStepPress }: StepIndicatorProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: steps.length, now: current + 1 }}
      style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const tappable = done && Boolean(onStepPress);

        return (
          <View key={label} style={{ flex: index === steps.length - 1 ? 0 : 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                disabled={!tappable}
                onPress={() => onStepPress?.(index)}
                accessibilityRole={tappable ? 'button' : undefined}
                accessibilityLabel={`Step ${index + 1}: ${label}`}
                hitSlop={6}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: theme.radius.pill,
                  borderWidth: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active
                    ? theme.color.brand
                    : done
                      ? theme.color.brandTint
                      : theme.color.surface,
                  borderColor: active || done ? theme.color.brand : theme.color.border,
                }}>
                {done ? (
                  <Check size={16} color={theme.color.brandDark} />
                ) : (
                  <Text
                    variant="smallStrong"
                    style={{ color: active ? theme.color.textOnBrand : theme.color.textMuted }}>
                    {index + 1}
                  </Text>
                )}
              </Pressable>

              {index < steps.length - 1 ? (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    marginHorizontal: theme.spacing.xs,
                    backgroundColor: done ? theme.color.brand : theme.color.border,
                  }}
                />
              ) : null}
            </View>

            <Text
              variant="overline"
              color={active ? 'brandDark' : 'textMuted'}
              style={{ marginTop: theme.spacing.xs, width: 56 }}
              numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
