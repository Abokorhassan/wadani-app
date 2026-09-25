import { Image } from 'expo-image';
import { Check, CreditCard } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text, useTheme } from '@/design-system';

import { PAYMENT_LOGOS } from '../logos';
import { CHARGE_METHODS, PAYMENT_METHODS } from '../methods';
import type { ChargeMethod } from '../types';

export interface PaymentMethodPickerProps {
  value: ChargeMethod;
  onChange: (method: ChargeMethod) => void;
  /** Set when nothing valid is chosen; outlines the grid in the error colour. */
  error?: string;
}

/**
 * The four Sifalo methods as a 2×2 grid of cards, each led by the provider's
 * logo. Used by registration and by donations, so both look and behave alike.
 */
export function PaymentMethodPicker({ value, onChange, error }: PaymentMethodPickerProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View
        accessibilityRole="radiogroup"
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {CHARGE_METHODS.map((method) => (
          <MethodCard
            key={method}
            method={method}
            selected={method === value}
            onSelect={() => onChange(method)}
          />
        ))}
      </View>
      {error ? (
        <Text variant="caption" color="danger" style={{ fontFamily: theme.fonts.text600 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function MethodCard({
  method,
  selected,
  onSelect,
}: {
  method: ChargeMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const info = PAYMENT_METHODS[method];

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${info.label}, ${t(`register.methodHints.${method}`)}`}
      style={({ pressed }) => [
        {
          flexBasis: '47%',
          flexGrow: 1,
          gap: 14,
          padding: 14,
          paddingBottom: 16,
          borderRadius: theme.radius.card,
          borderWidth: selected ? 2 : 1,
          // A 1px border would shift the content when selected; pad it back.
          margin: selected ? 0 : 1,
          borderColor: selected ? theme.color.action : theme.color.border,
          backgroundColor: selected ? theme.color.actionTint : theme.color.surface,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        selected ? theme.shadow.raised : theme.shadow.hairline,
      ]}>
      <View
        style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <LogoPlate method={method} />
        <SelectionMark selected={selected} />
      </View>

      <View style={{ gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {info.label}
        </Text>
        <Text variant="caption" color={selected ? 'actionDeep' : 'textMuted'} numberOfLines={1}>
          {t(`register.methodHints.${method}`)}
        </Text>
      </View>
    </Pressable>
  );
}

/** Logos are square app icons, so they are shown the way a phone shows apps. */
const TILE = 48;

function LogoPlate({ method }: { method: ChargeMethod }) {
  const theme = useTheme();
  const logo = PAYMENT_LOGOS[method];
  const tile = {
    width: TILE,
    height: TILE,
    borderRadius: 14,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (logo) {
    const inset = logo.inset ?? 0;
    return (
      // A hairline keeps a white-backed logo (Waafi) from melting into the card.
      <View
        style={[
          tile,
          { borderWidth: 1, borderColor: theme.color.border },
          logo.background ? { backgroundColor: logo.background } : null,
        ]}>
        <Image
          source={logo.source}
          style={{ width: TILE - inset * 2, height: TILE - inset * 2 }}
          contentFit={inset ? 'contain' : 'cover'}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  if (method === 'CARD') {
    return (
      <View style={[tile, { backgroundColor: theme.color.surfaceInk }]}>
        <CreditCard size={24} color={theme.color.textOnInk} strokeWidth={1.8} />
      </View>
    );
  }

  // Stand-in for a method whose logo has not been supplied (see ../logos.ts).
  return (
    <View style={[tile, { borderWidth: 1, borderColor: theme.color.border }]}>
      <Text variant="bodyStrong" color="textSecondary" numberOfLines={1}>
        {PAYMENT_METHODS[method].label.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

function SelectionMark({ selected }: { selected: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        borderWidth: selected ? 0 : 1.5,
        borderColor: theme.color.borderStrong,
        backgroundColor: selected ? theme.color.action : theme.color.surface,
      }}>
      {selected ? <Check size={14} color={theme.color.textOnAction} strokeWidth={3} /> : null}
    </View>
  );
}
