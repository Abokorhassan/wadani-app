import { useTranslation } from 'react-i18next';

/**
 * The membership card always reads in Somali, whatever language the app is in
 * (party, 2026-11-25): it is the party's printed card, and Save / Share give
 * the same image to everyone.
 */
export const CARD_LANGUAGE = 'so';

/** `t` for text drawn on the card itself. Screen chrome around it follows the app. */
export function useCardTranslation() {
  const { i18n } = useTranslation();
  return i18n.getFixedT(CARD_LANGUAGE);
}
