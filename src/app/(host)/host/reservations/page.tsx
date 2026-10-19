import { redirect } from 'next/navigation';
import { getHostSession, getOwnedVenues } from '@/lib/host';
import { listBookingsForVenues } from '@/lib/firebase/venues';

export const dynamic = 'force-dynamic';

const statusStyles: Record<string, string> = {
  confirmed: 'badge badge-amber',
  pending: 'badge',
  cancelled: 'badge',
};

function fmtDay(day: string) {
  return new Date(`${day}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function ReservationsPage() {
  const host = await getHostSession();
  if (!host) redirect('/login?callbackUrl=/host');

  const venues = await getOwnedVenues(host.userId);
  if (venues.length === 0) redirect('/host/claim');

  // Most recent first.
  const bookings = (await listBookingsForVenues(venues.map((v) => ({ id: v.id, name: v.name })))).reverse();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink-1)]">Reservations</h2>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          Every booking guests have made for your {venues.length === 1 ? 'venue' : 'venues'}.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="card card-p text-center py-14">
          <p className="text-sm text-[var(--ink-3)]">No reservations yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-[var(--line)]">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink-1)] truncate">{b.venueName}</p>
                  <p className="text-xs text-[var(--ink-3)] mt-0.5 truncate">{b.userName} · {b.duration}h</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--ink-1)]">{fmtDay(b.date)}</p>
                    <p className="text-xs text-[var(--ink-3)]">${b.totalPrice.toFixed(0)}</p>
                  </div>
                  <span className={statusStyles[b.status] ?? 'badge'}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
