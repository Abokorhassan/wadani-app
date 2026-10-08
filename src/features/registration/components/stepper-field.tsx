import { Minus, Plus, type LucideIcon } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { Text, useTheme } from '@/design-system';
import { formatUsd } from '@/lib/format';

/** "$25", or "$25.50" when there are cents. */
export const shortUsd = (amount: number): string =>
  Number.isInteger(amount) ? `$${amount}` : formatUsd(amount);

/** A number as the field stores it: no trailing ".00" for whole dollars. */
export const amountText = (amount: number): string =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

/**
 * Up to four one-tap amounts across a range: the lowest, two in between and the
 * highest, rounded to the step so they read as round numbers.
 */
export function suggestedAmounts(min: number, max: number, step: number): number[] {
  if (max <= min) return [];
  const width = max - min;
  const middle = [min + width / 3, min + (2 * width) / 3].map((amount) =>
    Math.min(max, Math.max(min, Math.round(amount / step) * step))
  );
  return [...new Set([min, ...middle, max])];
}

export interface StepperFieldProps {
  label: string;
  /** Under the figure, e.g. "Between $5 and $20". */
  hint: string;
  /** Before the figure, in the same size, e.g. "$". */
  prefix?: string;
  /** After the figure, smaller, e.g. "months". */
  suffix?: string;
  /** As typed, so a half-entered "2" is not rewritten on its way to "25". */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  min: number;
  max: number;
  /** How much − and + move, and what the one-tap values are rounded to. */
  step: number;
  /** One-tap values, shown as a row of chips. */
  options: number[];
  optionLabel: (value: number) => string;
  /** Spoken for a chip whose label is shortened to fit, e.g. "24" -> "24 months". */
  optionA11yLabel?: (value: number) => string;
  /** How a number is written back into the field. */
  format: (value: number) => string;
  /** The field's text as a number, or null while it is not a usable one. */
  parse: (value: string) => number | null;
  keyboardType: 'decimal-pad' | 'number-pad';
  maxLength: number;
  lowerLabel: string;
  higherLabel: string;
  error?: string;
}

/**
 * A figure the member can type into, nudge with − and +, or set in one tap.
 *
 * The amount and the membership length are the same kind of choice, so they use
 * the same control: a member who works out one has already learnt the other.
 */
export function StepperField({
  label,
  hint,
  prefix,
  suffix,
  value,
  onChange,
  onBlur,
  min,
  max,
  step,
  options,
  optionLabel,
  optionA11yLabel,
  format,
  parse,
  keyboardType,
  maxLength,
  lowerLabel,
  higherLabel,
  error,
}: StepperFieldProps) {
  const theme = useTheme();
  const current = parse(value);
  // − and + work from the current figure, or from the bottom of the range if
  // the field is mid-edit and cannot be read. Both land inside [min, max] even
  // when the figure typed is outside it, so one tap brings it back in range.
  const base = current ?? min;
  const inRange = (value: number) => Math.min(max, Math.max(min, value));
  const lower = inRange((Math.ceil(base / step) - 1) * step);
  const higher = inRange((Math.floor(base / step) + 1) * step);

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <StepButton
          icon={Minus}
          label={lowerLabel}
          disabled={current !== null && current <= min}
          onPress={() => onChange(format(lower))}
        />
        <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            {prefix ? (
              <Text variant="amount" style={FIGURE}>
                {prefix}
              </Text>
            ) : null}
            <TextInput
              value={value}
              onChangeText={(text) =>
                onChange(text.replace(keyboardType === 'number-pad' ? /[^\d]/g : /[^\d.]/g, ''))
              }
              onBlur={onBlur}
              keyboardType={keyboardType}
              maxLength={maxLength}
              selectTextOnFocus
              accessibilityLabel={label}
              selectionColor={theme.color.action}
              cursorColor={theme.color.action}
              style={[
                theme.typography.amount,
                FIGURE,
                {
                  minWidth: 28,
                  paddingVertical: 0,
                  paddingHorizontal: 0,
                  textAlign: 'center',
                  color: theme.color.text,
                },
              ]}
            />
            {suffix ? (
              <Text variant="bodyMedium" color="textSecondary" style={{ marginLeft: 6 }}>
                {suffix}
              </Text>
            ) : null}
          </View>
          <Text variant="caption" color="textMuted" center>
            {hint}
          </Text>
        </View>
        <StepButton
          icon={Plus}
          label={higherLabel}
          disabled={current !== null && current >= max}
          onPress={() => onChange(format(higher))}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {options.map((option) => {
          const selected = current === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(format(option))}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={(optionA11yLabel ?? optionLabel)(option)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 42,
                borderRadius: theme.radius.pill,
                borderWidth: selected ? 2 : 1.5,
                borderColor: selected ? theme.color.action : theme.color.borderStrong,
                backgroundColor: selected ? theme.color.actionTint : theme.color.surface,
              }}>
              <Text variant="smallStrong" color={selected ? 'text' : 'textSecondary'}>
                {optionLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text variant="caption" color="danger" style={{ fontFamily: theme.fonts.text600 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** Big enough to read at arm's length, small enough for "$20" and "60 months". */
const FIGURE = { fontSize: 40, lineHeight: 48 } as const;

function StepButton({
  icon: Icon,
  label,
  disabled,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 23,
        backgroundColor: theme.color.actionTint,
        opacity: disabled ? 0.35 : pressed ? 0.7 : 1,
      })}>
      <Icon size={22} color={theme.color.actionDeep} strokeWidth={2.4} />
    </Pressable>
  );
}
