import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { StorageKey, storage } from '@/lib/storage';

import en from './locales/en.json';
import so from './locales/so.json';

export const SUPPORTED_LANGUAGES = ['en', 'so'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

function initialLanguage(): Language {
  const saved = storage.getString(StorageKey.language);
  if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) return saved as Language;

  const device = getLocales()[0]?.languageCode;
  return device && SUPPORTED_LANGUAGES.includes(device as Language) ? (device as Language) : 'en';
}

/**
 * Somali translations are incomplete on purpose: keys fall back to English
 * until the party reviews the copy (build-plan D13).
 */
void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    so: { translation: so },
  },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLanguage(language: Language): void {
  storage.set(StorageKey.language, language);
  void i18n.changeLanguage(language);
}

export default i18n;
