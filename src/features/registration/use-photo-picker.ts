import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/design-system';

/**
 * The membership-card photo, chosen from the gallery (build-plan D4). It is
 * required: the backend rejects a registration without a `photoUrl`. Cropped
 * square and re-encoded at 0.7 so the upload stays small on a mobile network.
 */
export function usePhotoPicker(onPicked: (uri: string) => void) {
  const { t } = useTranslation();
  const toast = useToast();

  return async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.show(t('register.photoDenied'), 'danger');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      onPicked(result.assets[0].uri);
    }
  };
}
