import { Redirect } from 'expo-router';

import { useSessionStore } from '@/features/auth/session-store';

/** Entry point: send the member to the app or to the welcome screen. */
export default function Index() {
  const status = useSessionStore((state) => state.status);
  const memberStatus = useSessionStore((state) => state.member?.status);

  if (status === 'restoring') return null;
  if (status !== 'signed-in') return <Redirect href="/welcome" />;
  // The card is only issued once Sifalo settles the charge (build-plan D2).
  if (memberStatus === 'registered' || memberStatus === 'paymentPending')
    return <Redirect href="/pending" />;
  return <Redirect href="/home" />;
}
