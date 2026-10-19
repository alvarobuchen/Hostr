import { redirect } from 'next/navigation';
import { getHostSession, getOwnedVenues } from '@/lib/host';
import { AvailabilityManager } from './availability-manager';

export const dynamic = 'force-dynamic';

export default async function AvailabilityPage() {
  const host = await getHostSession();
  if (!host) redirect('/login?callbackUrl=/host');

  const venues = await getOwnedVenues(host.userId);
  if (venues.length === 0) redirect('/host/claim');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink-1)]">Availability</h2>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          Your venue is open every day by default. Click a date to block it — blocked and
          already-booked dates can&apos;t be reserved by guests.
        </p>
      </div>
      <AvailabilityManager venues={venues.map((v) => ({ id: v.id, name: v.name }))} />
    </div>
  );
}
