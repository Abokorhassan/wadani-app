import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './text';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export interface SelectFieldProps<T extends string = string> {
  label: string;
  value?: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  disabled?: boolean;
  testID?: string;
}

/** Select rendered as a bottom sheet, so long option lists stay usable. */
export function SelectField<T extends string = string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  error,
  hint,
  optional,
  disabled,
  testID,
}: SelectFieldProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        <Text variant="smallStrong" color="textSecondary">
          {label}
        </Text>
        {optional ? (
          <Text variant="caption" color="textMuted">
            optional
          </Text>
        ) : null}
      </View>

      <Pressable
        testID={testID}
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityState={{ disabled, expanded: open }}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: theme.spacing.xs + 2,
          borderWidth: 1.5,
          borderColor: error ? theme.color.danger : theme.color.border,
          borderRadius: theme.radius.md,
          backgroundColor: pressed ? theme.color.surfaceSunken : theme.color.surface,
          paddingHorizontal: theme.spacing.md,
          minHeight: theme.hitSize + 6,
          opacity: disabled ? 0.5 : 1,
        })}>
        <Text variant="body" color={selected ? 'text' : 'textMuted'}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={20} color={theme.color.textMuted} />
      </Pressable>

      {error ? (
        <Text variant="caption" color="danger" style={{ marginTop: theme.spacing.xs }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted" style={{ marginTop: theme.spacing.xs }}>
          {hint}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          accessibilityLabel="Close"
          style={{ flex: 1, backgroundColor: theme.color.overlay, justifyContent: 'flex-end' }}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: theme.color.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.xxl,
              maxHeight: '70%',
            }}>
            <Text variant="heading" style={{ paddingHorizontal: theme.spacing.lg }}>
              {label}
            </Text>

            <ScrollView style={{ marginTop: theme.spacing.md }}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: theme.spacing.md,
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.lg - 2,
                      backgroundColor: pressed ? theme.color.surfaceSunken : 'transparent',
                    })}>
                    <View style={{ flex: 1 }}>
                      <Text variant={isSelected ? 'bodyStrong' : 'body'}>{option.label}</Text>
                      {option.description ? (
                        <Text variant="caption" color="textMuted">
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? <Check size={20} color={theme.color.action} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
