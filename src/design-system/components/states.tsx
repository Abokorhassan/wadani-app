import { AlertCircle, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, View, type DimensionValue } from 'react-native';

import { useTheme } from '../theme';
import { Button } from './button';
import { Text } from './text';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{ alignItems: 'center', paddingVertical: theme.spacing.xxxl, gap: theme.spacing.sm }}>
      {Icon ? (
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.color.brandTint,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.xs,
          }}>
          <Icon size={26} color={theme.color.brandDeep} />
        </View>
      ) : null}
      <Text variant="heading" center>
        {title}
      </Text>
      {message ? (
        <Text variant="small" color="textMuted" center style={{ maxWidth: 280 }}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          block={false}
          size="sm"
          style={{ marginTop: theme.spacing.sm }}
        />
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Something didn't load",
  message = 'Check your connection and try again.',
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.xl,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.surface,
      }}>
      <AlertCircle size={26} color={theme.color.danger} />
      <Text variant="bodyStrong" center>
        {title}
      </Text>
      <Text variant="small" color="textMuted" center>
        {message}
      </Text>
      {onRetry ? (
        <Button
          label={retryLabel}
          onPress={onRetry}
          variant="secondary"
          size="sm"
          block={false}
          style={{ marginTop: theme.spacing.xs }}
        />
      ) : null}
    </View>
  );
}

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  const theme = useTheme();
  const [pulse] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.sm,
          backgroundColor: theme.color.surfaceSunken,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}
