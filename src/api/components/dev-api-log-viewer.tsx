import { Code2, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, useTheme } from '@/design-system';

import { useDevApiLog, type DevApiCall } from '../dev-log';

/**
 * A floating button, dev builds only, that opens every API call the app has
 * made: method, URL, what was sent, and exactly what came back -- status and
 * body -- for whoever is testing the app on the device, without needing
 * `adb logcat` or someone else reading it for them.
 *
 * Mounted once near the root (`_layout.tsx`); `__DEV__` is false in a release
 * build, so neither this nor the log it reads can reach a shipped app.
 */
export function DevApiLogViewer() {
  const insets = useSafeAreaInsets();
  const calls = useDevApiLog((state) => state.calls);
  const clear = useDevApiLog((state) => state.clear);
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const pending = calls.filter((call) => call.status === undefined && !call.networkError).length;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`API log, ${calls.length} calls`}
        style={{
          position: 'absolute',
          right: 14,
          // Bottom-right, above the tab bar: screens keep the top corners for their own controls.
          bottom: Math.max(insets.bottom, 12) + 88,
          zIndex: 50,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: theme.radius.pill,
          backgroundColor: 'rgba(26, 21, 18, 0.82)',
        }}>
        <Code2 size={14} color="#fff" />
        <Text variant="caption" style={{ color: '#fff', fontFamily: theme.fonts.text700 }}>
          API{calls.length ? ` (${calls.length})` : ''}
          {pending ? '…' : ''}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.color.background }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
              paddingTop: insets.top + theme.spacing.sm,
              paddingBottom: theme.spacing.md,
              paddingHorizontal: theme.spacing.gutter,
              borderBottomWidth: 1,
              borderBottomColor: theme.color.border,
            }}>
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              API log (dev only)
            </Text>
            <Pressable onPress={clear} hitSlop={10}>
              <Trash2 size={18} color={theme.color.textMuted} />
            </Pressable>
            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
              <X size={20} color={theme.color.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: theme.spacing.gutter, gap: 10 }}>
            {calls.length === 0 ? (
              <Text variant="body" color="textMuted" style={{ marginTop: 24 }} center>
                No API calls yet. They will appear here as the app makes them.
              </Text>
            ) : (
              calls.map((call) => <CallRow key={call.id} call={call} />)
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function statusColor(call: DevApiCall, theme: ReturnType<typeof useTheme>): string {
  if (call.networkError) return theme.color.danger;
  if (call.status === undefined) return theme.color.textMuted;
  if (call.status >= 200 && call.status < 300) return theme.color.action;
  return theme.color.danger;
}

function CallRow({ call }: { call: DevApiCall }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const path = call.url.replace(/^https?:\/\/[^/]+/, '');
  const statusLabel = call.networkError ? 'no response' : (call.status?.toString() ?? '…');

  return (
    <Pressable
      onPress={() => setExpanded((value) => !value)}
      style={{
        borderRadius: theme.radius.card,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.surface,
        padding: 14,
        gap: 6,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text
          variant="caption"
          style={{
            fontFamily: theme.fonts.text700,
            color: statusColor(call, theme),
            minWidth: 40,
          }}>
          {statusLabel}
        </Text>
        <Text variant="caption" color="textMuted" style={{ fontFamily: theme.fonts.text600 }}>
          {call.method}
        </Text>
        <Text variant="small" style={{ flex: 1 }} numberOfLines={expanded ? undefined : 1}>
          {path}
        </Text>
      </View>

      {expanded ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          {call.requestBody !== undefined ? (
            <JsonBlock label="Sent" value={call.requestBody} />
          ) : null}
          <JsonBlock
            label="Received"
            value={call.networkError ? undefined : call.responseBody}
            fallback={
              call.networkError
                ? String(call.responseBody ?? 'Network error')
                : call.status === undefined
                  ? 'Waiting…'
                  : undefined
            }
          />
        </View>
      ) : null}
    </Pressable>
  );
}

function JsonBlock({
  label,
  value,
  fallback,
}: {
  label: string;
  value: unknown;
  fallback?: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: 3 }}>
      <Text variant="overline" color="textMuted">
        {label}
      </Text>
      <View
        style={{
          borderRadius: theme.radius.sm,
          backgroundColor: theme.color.surfaceSunken,
          padding: 10,
        }}>
        <Text variant="mono" style={{ fontSize: 12, lineHeight: 17 }} selectable>
          {fallback ?? JSON.stringify(value, null, 2)}
        </Text>
      </View>
    </View>
  );
}
