import { Redirect } from 'expo-router';

import { useSessionStore } from '@/features/auth/session-store';

/** Entry point: send the member to the app or to the welcome screen. */
export default function Index() {
  const status = useSessionStore((state) => state.status);

  if (status === 'restoring') return null;
  return <Redirect href={status === 'signed-in' ? '/home' : '/welcome'} />;
}
