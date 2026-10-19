import { redirect } from 'next/navigation';
import { getHostSession, getOwnedVenues } from '@/lib/host';
import { listBookingsForVenues } from '@/lib/firebase/venues';
import { PayoutsPanel } from './payouts-panel';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const host = await getHostSession();
  if (!host) redirect('/login?callbackUrl=/host');

  const venues = await getOwnedVenues(host.userId);
  if (venues.length === 0) redirect('/host/claim');

  // Booking-derived earnings summary (payments themselves are handled by Stripe).
  const bookings = (await listBookingsForVenues(venues.map((v) => ({ id: v.id, name: v.name })))).filter(
    (b) => b.status === 'confirmed',
  );
  const gross = bookings.reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink-1)]">Payments &amp; payouts</h2>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          Guests pay when they book. Connect a bank account to receive your payouts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card card-p">
          <p className="t-label mb-1.5">Confirmed bookings</p>
          <p className="text-2xl font-semibold text-[var(--ink-1)]">{bookings.length}</p>
        </div>
        <div className="card card-p">
          <p className="t-label mb-1.5">Gross booking value</p>
          <p className="text-2xl font-semibold text-[var(--ink-1)]">${gross.toFixed(0)}</p>
        </div>
      </div>

      <PayoutsPanel />
    </div>
  );
}
