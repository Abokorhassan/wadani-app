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
    <View style={{ gap: theme.spacing.sm }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
        {optional ? (
          <Text variant="captionStrong" color="textMuted">
            Optional
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
          height: theme.controlHeight.field,
          paddingHorizontal: theme.spacing.lg,
          borderWidth: 1.5,
          borderColor: error ? theme.color.danger : theme.color.fieldBorder,
          borderRadius: theme.radius.lg,
          backgroundColor: pressed ? theme.color.surfaceSunken : theme.color.surface,
          opacity: disabled ? 0.5 : 1,
        })}>
        <Text variant="bodyMedium" color={selected ? 'text' : 'textPlaceholder'}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={20} color={theme.color.textMuted} />
      </Pressable>

      {error ? (
        <Text variant="caption" color="danger" style={{ fontFamily: theme.fonts.text600 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted">
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
              maxHeight: '70%',
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.xxl,
              borderTopLeftRadius: theme.radius.sheet,
              borderTopRightRadius: theme.radius.sheet,
              backgroundColor: theme.color.background,
            }}>
            <Text variant="heading" style={{ paddingHorizontal: theme.spacing.gutter }}>
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
                      minHeight: 56,
                      paddingHorizontal: theme.spacing.gutter,
                      backgroundColor: pressed ? theme.color.surfaceSunken : 'transparent',
                    })}>
                    <View style={{ flex: 1 }}>
                      <Text variant={isSelected ? 'bodyStrong' : 'bodyMedium'}>{option.label}</Text>
                      {option.description ? (
                        <Text variant="caption" color="textMuted">
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Check size={20} color={theme.color.action} strokeWidth={2.6} />
                    ) : null}
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
