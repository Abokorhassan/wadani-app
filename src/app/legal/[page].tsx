import { useLocalSearchParams } from 'expo-router';

import { isLegalPage, LegalScreen } from '@/features/settings';

/** Outside both route groups, so it opens whether or not someone is signed in. */
export default function LegalRoute() {
  const { page } = useLocalSearchParams<{ page: string }>();
  return <LegalScreen page={isLegalPage(page) ? page : 'privacy'} />;
}
