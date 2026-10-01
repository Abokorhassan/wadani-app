import { Check, ChevronDown, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';

import { COUNTRY_CODES, SOMALI_DIAL, splitPhone, type CountryCode } from '@/lib/country-codes';

import { useTheme } from '../theme';
import { Text } from './text';
import { TextField, type TextFieldProps } from './text-field';

export interface PhoneFieldProps extends Omit<TextFieldProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (value: string) => void;
  /**
   * Lets the member pick a dialling code. The value is then written as
   * "<dial> <number>", e.g. "+44 7911 123456". Left out, the field is fixed to
   * +252 and the value is only what was typed: wallet numbers are Somali.
   */
  countryPicker?: { title: string; searchPlaceholder: string };
}

/** Phone input. Somaliland's +252 by default, any country with `countryPicker`. */
export function PhoneField({ countryPicker, value, onChangeText, ...props }: PhoneFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  // Holds the code while the number is still empty, when the value cannot.
  const [emptyDial, setEmptyDial] = useState(SOMALI_DIAL);

  if (!countryPicker) {
    return (
      <TextField
        keyboardType="phone-pad"
        autoComplete="tel"
        prefix={SOMALI_DIAL}
        placeholder="63 234 5678"
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    );
  }

  const parsed = splitPhone(value);
  const dial = value ? parsed.dial : emptyDial;
  const national = value ? parsed.national : '';
  const write = (nextDial: string, nextNational: string) =>
    onChangeText(nextNational ? `${nextDial} ${nextNational}` : '');

  return (
    <>
      <TextField
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder={dial === SOMALI_DIAL ? '63 234 5678' : undefined}
        value={national}
        onChangeText={(text) => write(dial, text)}
        leading={
          <>
            <Pressable
              onPress={() => setOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`${countryPicker.title}, ${dial}`}
              hitSlop={8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text variant="bodyMedium" style={{ fontFamily: theme.fonts.text600 }}>
                {dial}
              </Text>
              <ChevronDown size={16} color={theme.color.textMuted} />
            </Pressable>
            <View style={{ width: 1, height: 24, backgroundColor: theme.color.borderStrong }} />
          </>
        }
        {...props}
      />
      <CountrySheet
        visible={open}
        title={countryPicker.title}
        searchPlaceholder={countryPicker.searchPlaceholder}
        selected={dial}
        onClose={() => setOpen(false)}
        onSelect={(country) => {
          setOpen(false);
          setEmptyDial(country.dial);
          if (national) write(country.dial, national);
        }}
      />
    </>
  );
}

function CountrySheet({
  visible,
  title,
  searchPlaceholder,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  searchPlaceholder: string;
  selected: string;
  onClose: () => void;
  onSelect: (country: CountryCode) => void;
}) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase().replace(/^\+/, '');
  const countries = needle
    ? COUNTRY_CODES.filter(
        (country) =>
          country.name.toLowerCase().includes(needle) || country.dial.slice(1).startsWith(needle)
      )
    : COUNTRY_CODES;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        accessibilityLabel={title}
        style={{ flex: 1, backgroundColor: theme.color.overlay, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            height: '75%',
            paddingTop: theme.spacing.xl,
            borderTopLeftRadius: theme.radius.sheet,
            borderTopRightRadius: theme.radius.sheet,
            backgroundColor: theme.color.background,
          }}>
          <Text variant="heading" style={{ paddingHorizontal: theme.spacing.gutter }}>
            {title}
          </Text>
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
              style={[theme.typography.bodyMedium, { flex: 1, color: theme.color.text }]}
            />
          </View>
          <FlatList
            data={countries}
            keyExtractor={(country) => country.id}
            keyboardShouldPersistTaps="handled"
            style={{ marginTop: theme.spacing.sm }}
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
            renderItem={({ item }) => {
              const isSelected = item.dial === selected;
              return (
                <Pressable
                  onPress={() => {
                    setQuery('');
                    onSelect(item);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    minHeight: 52,
                    paddingHorizontal: theme.spacing.gutter,
                    backgroundColor: pressed ? theme.color.surfaceSunken : 'transparent',
                  })}>
                  <Text
                    variant={isSelected ? 'bodyStrong' : 'bodyMedium'}
                    style={{ flex: 1 }}
                    numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text variant="bodyMedium" color="textMuted">
                    {item.dial}
                  </Text>
                  <View style={{ width: 20 }}>
                    {isSelected ? (
                      <Check size={20} color={theme.color.action} strokeWidth={2.6} />
                    ) : null}
                  </View>
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
