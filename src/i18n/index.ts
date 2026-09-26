import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { StorageKey, storage } from '@/lib/storage';

import en from './locales/en.json';
import so from './locales/so.json';

export const SUPPORTED_LANGUAGES = ['en', 'so'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** Each language in its own name, so the switch reads the same in both. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  so: 'Soomaali',
};

function initialLanguage(): Language {
  const saved = storage.getString(StorageKey.language);
  if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) return saved as Language;

  const device = getLocales()[0]?.languageCode;
  return device && SUPPORTED_LANGUAGES.includes(device as Language) ? (device as Language) : 'en';
}

/**
 * English and Somali (build-plan D13). A key missing from Somali falls back to
 * English; a test keeps the two bundles in step.
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

export function toLanguage(code: string | undefined): Language {
  return SUPPORTED_LANGUAGES.includes(code as Language) ? (code as Language) : 'en';
}

export function setLanguage(language: Language): void {
  storage.set(StorageKey.language, language);
  void i18n.changeLanguage(language);
}

export default i18n;
