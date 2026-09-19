import { Redirect } from 'expo-router';

import { useSessionStore } from '@/features/auth/session-store';

/** Entry point: send the member to the app or to the welcome screen. */
export default function Index() {
  const status = useSessionStore((state) => state.status);
  const memberStatus = useSessionStore((state) => state.member?.status);

  if (status === 'restoring') return null;
  if (status !== 'signed-in') return <Redirect href="/welcome" />;
  // Approval is still outstanding, so the app itself stays closed (build-plan D2).
  if (memberStatus === 'pending' || memberStatus === 'rejected')
    return <Redirect href="/pending" />;
  return <Redirect href="/home" />;
}
