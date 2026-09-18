import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { useToast } from '@/design-system';

type Busy = 'save' | 'share' | null;

/** Save the card image to Photos, or hand it to the share sheet (build-plan D16). */
export function useCardActions(cardRef: RefObject<View | null>) {
  const { t } = useTranslation();
  const toast = useToast();
  const [busy, setBusy] = useState<Busy>(null);

  const capture = () => captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });

  const save = async () => {
    if (busy) return;
    setBusy('save');
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) {
        toast.show(t('card.photosDenied'), 'danger');
        return;
      }
      await MediaLibrary.Asset.create(await capture());
      toast.show(t('card.saved'), 'success');
    } catch {
      toast.show(t('card.saveFailed'), 'danger');
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    if (busy) return;
    setBusy('share');
    try {
      if (!(await Sharing.isAvailableAsync())) return;
      await Sharing.shareAsync(await capture(), {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: t('card.shareTitle'),
      });
    } catch {
      // Closing the share sheet is not an error worth reporting.
    } finally {
      setBusy(null);
    }
  };

  return { save, share, busy };
}
