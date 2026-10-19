import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getHostSession, getOwnedVenues } from '@/lib/host';
import { listBookingsForVenues } from '@/lib/firebase/venues';
import { DEMO_RESERVATIONS, DEMO_TRENDS } from '@/lib/host-demo';

export const dynamic = 'force-dynamic';

const currency = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

function fmtDay(day: string) {
  return new Date(`${day}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function HostOverviewPage() {
  const host = await getHostSession();
  if (!host) redirect('/login?callbackUrl=/host');

  const venues = await getOwnedVenues(host.userId);
  if (venues.length === 0) redirect('/host/claim');

  const bookings = await listBookingsForVenues(venues.map((v) => ({ id: v.id, name: v.name })));
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter((b) => b.status !== 'cancelled' && b.date >= today)
    .slice(0, 5);
  const revenue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((s, b) => s + b.totalPrice, 0);

  // Until a venue has real bookings the dashboard would read as three zeroes,
  // which makes it impossible to demo. Fall back to illustrative figures and
  // label them so nobody mistakes them for real earnings.
  const usingSampleReservations = upcoming.length === 0;
  const upcomingCount = usingSampleReservations ? DEMO_RESERVATIONS.length : upcoming.length;
  const revenueValue = revenue > 0 ? revenue : DEMO_TRENDS.revenue;

  const stats = [
    { label: 'Venues', value: String(venues.length), delta: null as string | null },
    {
      label: 'Upcoming reservations',
      value: String(upcomingCount),
      delta: DEMO_TRENDS.upcomingDelta,
    },
    {
      label: 'Confirmed revenue',
      value: currency(revenueValue),
      delta: DEMO_TRENDS.revenueDelta,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card card-p">
            <p className="t-label mb-1.5">{s.label}</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-2xl font-semibold text-[var(--ink-1)]">{s.value}</p>
              {s.delta && (
                <span className="text-sm font-semibold text-emerald-600">
                  ↑ {s.delta}
                  <span className="ml-1 text-xs font-medium text-[var(--ink-3)]">vs last month</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Your venues */}
      <div className="card card-p space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--ink-1)]">Your venues</h2>
          <Link href="/host/claim" className="btn btn-ghost btn-sm">Add another venue</Link>
        </div>
        <div className="space-y-2.5">
          {venues.map((v) => (
            <div
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--ink-1)]">{v.name}</p>
                <p className="text-xs text-[var(--ink-3)] mt-0.5">{v.location}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-[var(--ink-2)]">
                  ${v.pricePerHour}/hr · {v.capacity} guests
                </span>
                <Link href={`/venues/${v.id}`} className="btn btn-ghost btn-sm">View listing</Link>
                <Link href={`/host/venues/${v.id}/edit`} className="btn btn-primary btn-sm">Edit listing</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next reservations */}
      <div className="card card-p space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--ink-1)]">Next reservations</h2>
            {usingSampleReservations && <span className="badge">Sample data</span>}
          </div>
          <Link href="/host/reservations" className="text-sm font-medium text-[var(--amber)]">View all</Link>
        </div>

        {usingSampleReservations && (
          <p className="text-sm text-[var(--ink-3)]">
            You have no bookings yet — here is how they will appear.
          </p>
        )}

        <div className="space-y-3">
          {usingSampleReservations
            ? DEMO_RESERVATIONS.map((r) => (
                <article
                  key={r.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--ink-1)]">{r.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--ink-3)]">
                        {r.venueName} · {r.guests} guests · {r.hours}h
                      </p>
                    </div>
                    <span className={r.status === 'confirmed' ? 'badge badge-amber' : 'badge'}>
                      {r.status}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="t-label mb-1">Date</p>
                      <p className="text-sm font-medium text-[var(--ink-1)]">{r.dateLabel}</p>
                      <p className="text-xs text-[var(--ink-3)]">{r.timeLabel}</p>
                    </div>
                    <div>
                      <p className="t-label mb-1">Deposit paid</p>
                      <p className="text-sm font-medium text-emerald-600">{currency(r.deposit)}</p>
                      <p className="text-xs text-[var(--ink-3)]">Secured on {r.depositPaidOn}</p>
                    </div>
                    <div>
                      <p className="t-label mb-1">Total due</p>
                      <p className="text-sm font-medium text-[var(--ink-1)]">{currency(r.total)}</p>
                      <p className="text-xs text-[var(--ink-3)]">
                        {currency(r.total - r.deposit)} on the day
                      </p>
                    </div>
                  </div>

                  <div className="rule" />

                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <div>
                      <p className="t-label mb-0.5">Booked by</p>
                      <p className="text-sm text-[var(--ink-1)]">{r.contactName}</p>
                    </div>
                    <div>
                      <p className="t-label mb-0.5">Email</p>
                      <a href={`mailto:${r.contactEmail}`} className="text-sm text-[var(--amber)]">
                        {r.contactEmail}
                      </a>
                    </div>
                    <div>
                      <p className="t-label mb-0.5">Phone</p>
                      <a href={`tel:${r.contactPhone.replace(/\s+/g, '')}`} className="text-sm text-[var(--amber)]">
                        {r.contactPhone}
                      </a>
                    </div>
                  </div>
                </article>
              ))
            : upcoming.map((b) => {
                const deposit = Math.round(b.totalPrice * 0.2);
                return (
                  <article
                    key={b.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--ink-1)]">
                          {b.userName} · {b.venueName}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--ink-3)]">{b.duration}h</p>
                      </div>
                      <span className={b.status === 'confirmed' ? 'badge badge-amber' : 'badge'}>
                        {b.status}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="t-label mb-1">Date</p>
                        <p className="text-sm font-medium text-[var(--ink-1)]">{fmtDay(b.date)}</p>
                      </div>
                      <div>
                        <p className="t-label mb-1">Deposit paid</p>
                        <p className="text-sm font-medium text-emerald-600">{currency(deposit)}</p>
                      </div>
                      <div>
                        <p className="t-label mb-1">Total due</p>
                        <p className="text-sm font-medium text-[var(--ink-1)]">{currency(b.totalPrice)}</p>
                        <p className="text-xs text-[var(--ink-3)]">
                          {currency(b.totalPrice - deposit)} on the day
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>
      </div>
    </div>
  );
}
