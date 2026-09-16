import * as SecureStore from 'expo-secure-store';

/**
 * Tokens only. Reads and writes are wrapped because the keychain can fail on a
 * locked or restored device, and a failure there must never crash the app.
 */
export const SecureKey = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
} as const;

export async function getSecure(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecure(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // ignore: the session simply won't survive a restart
  }
}

export async function deleteSecure(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}
