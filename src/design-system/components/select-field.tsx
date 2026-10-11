import { Check, ChevronDown, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';

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
  /** Adds a search box above the list; for long lists such as countries. */
  searchPlaceholder?: string;
  error?: string;
  hint?: string;
  /** Marker beside the label for a field that can be left empty, e.g. "Optional". */
  optional?: string;
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
  searchPlaceholder,
  error,
  hint,
  optional,
  disabled,
  testID,
}: SelectFieldProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
        {optional ? (
          <Text variant="captionStrong" color="textMuted">
            {optional}
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
        <Text
          variant="bodyMedium"
          color={selected ? 'text' : 'textPlaceholder'}
          numberOfLines={1}
          style={{ flex: 1 }}>
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

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable
          onPress={close}
          accessibilityLabel="Close"
          style={{ flex: 1, backgroundColor: theme.color.overlay, justifyContent: 'flex-end' }}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              // A search box needs room for the keyboard and a few results.
              height: searchPlaceholder ? '75%' : undefined,
              maxHeight: searchPlaceholder ? undefined : '70%',
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.xxl,
              borderTopLeftRadius: theme.radius.sheet,
              borderTopRightRadius: theme.radius.sheet,
              backgroundColor: theme.color.background,
            }}>
            <Text variant="heading" style={{ paddingHorizontal: theme.spacing.gutter }}>
              {label}
            </Text>
            {searchPlaceholder ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  marginTop: theme.spacing.md,
                  marginHorizontal: theme.spacing.gutter,
                  height: 48,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.radius.lg,
                  borderWidth: 1.5,
                  borderColor: theme.color.fieldBorder,
                  backgroundColor: theme.color.surface,
                }}>
                <Search size={18} color={theme.color.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={theme.color.textPlaceholder}
                  autoCorrect={false}
                  accessibilityLabel={searchPlaceholder}
                  style={[theme.typography.bodyMedium, { flex: 1, color: theme.color.text }]}
                />
              </View>
            ) : null}
            <FlatList
              data={shown}
              keyExtractor={(option) => option.value}
              keyboardShouldPersistTaps="handled"
              style={{ marginTop: theme.spacing.md }}
              initialNumToRender={20}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      close();
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
                      <Text variant={isSelected ? 'bodyStrong' : 'bodyMedium'}>{item.label}</Text>
                      {item.description ? (
                        <Text variant="caption" color="textMuted">
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Check size={20} color={theme.color.action} strokeWidth={2.6} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
