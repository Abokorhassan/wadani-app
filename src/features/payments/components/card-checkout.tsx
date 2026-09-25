import { Lock, X } from 'lucide-react-native';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { pickApi } from '@/api/mode';
import { IconButton, Text, useTheme } from '@/design-system';

import { paymentsApi } from '../api';
import { paymentsApiMock } from '../api.mock';
import { cardReturnUrl, readCardReturn } from '../card-return';
import { settleCheckout } from '../settle-checkout';
import type { CardCheckout, CheckoutOutcome } from '../types';

const api = pickApi('payments', paymentsApi, paymentsApiMock);

type RunCheckout = (checkout: CardCheckout) => Promise<CheckoutOutcome>;

const CardCheckoutContext = createContext<RunCheckout | null>(null);

/**
 * Runs a Sifalo card checkout inside the app.
 *
 * Sifalo's checkout is a web page that ends by redirecting to our return URL.
 * An external browser would strand the member there, so the page opens in an
 * in-app browser instead, which stops the moment it heads for the return URL,
 * reads `sid` and `checkout_id` from it, and confirms the payment itself. The
 * member never sees the return page and never leaves the app.
 *
 * Mounted once, near the root; screens call `useCardCheckout()`.
 */
export function CardCheckoutProvider({ children }: { children: ReactNode }) {
  const [checkout, setCheckout] = useState<CardCheckout | null>(null);
  const [confirming, setConfirming] = useState(false);
  const resolver = useRef<((outcome: CheckoutOutcome) => void) | null>(null);
  // The redirect can be reported more than once; the payment is settled once.
  const settling = useRef(false);

  const run = useCallback<RunCheckout>((next) => {
    settling.current = false;
    setConfirming(false);
    setCheckout(next);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const finish = useCallback(
    async (sid?: string) => {
      if (!checkout || settling.current) return;
      settling.current = true;
      setConfirming(true);
      const outcome = await settleCheckout(api, checkout.checkoutId, sid);
      setCheckout(null);
      setConfirming(false);
      resolver.current?.(outcome);
      resolver.current = null;
    },
    [checkout]
  );

  /** Called for every page the checkout tries to open; false stops it. */
  const allowNavigation = useCallback(
    (url: string): boolean => {
      const back = readCardReturn(url);
      if (!back) return true;
      void finish(back.sid);
      return false;
    },
    [finish]
  );

  return (
    <CardCheckoutContext.Provider value={run}>
      {children}
      <Modal
        visible={checkout !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => void finish()}>
        {checkout ? (
          <CheckoutSheet
            checkout={checkout}
            confirming={confirming}
            onClose={() => void finish()}
            allowNavigation={allowNavigation}
          />
        ) : null}
      </Modal>
    </CardCheckoutContext.Provider>
  );
}

export function useCardCheckout(): RunCheckout {
  const run = useContext(CardCheckoutContext);
  if (!run) throw new Error('useCardCheckout needs <CardCheckoutProvider> above it');
  return run;
}

function CheckoutSheet({
  checkout,
  confirming,
  onClose,
  allowNavigation,
}: {
  checkout: CardCheckout;
  confirming: boolean;
  onClose: () => void;
  allowNavigation: (url: string) => boolean;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const mock = checkout.checkoutUrl.startsWith('mock://');

  return (
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
          backgroundColor: theme.color.surface,
        }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{t('checkout.title')}</Text>
          {/* The address bar a browser would show: members should see who they pay. */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Lock size={12} color={theme.color.actionDeep} strokeWidth={2.4} />
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {mock ? t('checkout.testMode') : hostOf(checkout.checkoutUrl)}
            </Text>
          </View>
        </View>
        {/* Hidden while confirming: closing then would only re-ask the server. */}
        {confirming ? null : (
          <IconButton icon={X} accessibilityLabel={t('checkout.close')} onPress={onClose} />
        )}
      </View>

      <WebView
        source={
          mock
            ? { html: mockCheckoutPage(checkout.checkoutId), baseUrl: 'https://pay.sifalo.com/' }
            : { uri: checkout.checkoutUrl }
        }
        onShouldStartLoadWithRequest={(request) => allowNavigation(request.url)}
        // Belt and braces: some redirects are only reported as a state change.
        onNavigationStateChange={(state: WebViewNavigation) => {
          if (state.url) allowNavigation(state.url);
        }}
        setSupportMultipleWindows={false}
        startInLoadingState
        renderLoading={() => <Spinner />}
        style={{ flex: 1 }}
      />

      {confirming ? (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.md,
            backgroundColor: theme.color.background,
          }}>
          <ActivityIndicator color={theme.color.action} size="large" />
          <Text variant="bodyStrong">{t('checkout.confirming')}</Text>
          <Text variant="caption" color="textMuted">
            {t('checkout.dontClose')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Spinner() {
  const theme = useTheme();
  return (
    <View
      style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.color.action} size="large" />
    </View>
  );
}

function hostOf(url: string): string {
  return /^https?:\/\/([^/?#]+)/i.exec(url)?.[1] ?? url;
}

/**
 * A stand-in for Sifalo's page in mock mode: it ends the same way the real one
 * does, by redirecting to the return URL with a `sid`, so everything after it
 * runs for real. Nothing is charged; there is no card to charge.
 */
function mockCheckoutPage(checkoutId: string): string {
  const back = `${cardReturnUrl()}?checkout_id=${encodeURIComponent(checkoutId)}&sid=mock-sid`;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,Roboto,sans-serif;margin:0;padding:28px;background:#fff;color:#1a1512}
h1{font-size:20px;margin:0 0 6px}p{color:#6b625b;margin:0 0 24px;line-height:1.4}
.box{border:1px solid #e8e1d8;border-radius:16px;padding:18px;margin-bottom:24px}
a{display:block;text-align:center;padding:16px;border-radius:14px;font-weight:600;text-decoration:none;margin-bottom:12px}
.pay{background:#66783c;color:#fff}.cancel{border:1px solid #d9d0c5;color:#1a1512}</style></head><body>
<h1>Test checkout</h1><p>This stands in for Sifalo's card page in mock mode. No card is charged.</p>
<div class="box">Card ending 4242 &middot; Visa</div>
<a class="pay" href="${back}">Pay</a></body></html>`;
}
