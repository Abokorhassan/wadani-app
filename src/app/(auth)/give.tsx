import { DonateFlow } from '@/features/donations';

/** Donating without an account: opened from Welcome, no login needed. */
export default function GuestDonateScreen() {
  return <DonateFlow guest />;
}
