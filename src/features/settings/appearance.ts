import { useColorScheme } from 'react-native';
import { create } from 'zustand';

import { darkTheme, lightTheme, type Theme } from '@/design-system';
import { StorageKey, storage } from '@/lib/storage';

/** What the member picked; "system" follows the phone's own setting. */
export type Appearance = 'system' | 'light' | 'dark';

const APPEARANCES: readonly Appearance[] = ['system', 'light', 'dark'];

function savedAppearance(): Appearance {
  const saved = storage.getString(StorageKey.appearance);
  return APPEARANCES.includes(saved as Appearance) ? (saved as Appearance) : 'system';
}

interface AppearanceState {
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
}

export const useAppearanceStore = create<AppearanceState>((set) => ({
  appearance: savedAppearance(),
  setAppearance: (appearance) => {
    storage.set(StorageKey.appearance, appearance);
    set({ appearance });
  },
}));

/** The theme to render with: the member's choice, or the phone's when "system". */
export function useAppTheme(): Theme {
  const appearance = useAppearanceStore((state) => state.appearance);
  const system = useColorScheme();
  const dark = appearance === 'dark' || (appearance === 'system' && system === 'dark');
  return dark ? darkTheme : lightTheme;
}
