import { redirect } from 'next/navigation';
import { getHostSession, getOwnedVenues } from '@/lib/host';
import { HostNav } from './host-nav';

export const dynamic = 'force-dynamic';

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const host = await getHostSession();
  if (!host) redirect('/login?callbackUrl=/host');

  const ownedCount = (await getOwnedVenues(host.userId)).length;

  return (
    <div className="wrap page">
      <div className="mb-8">
        <p className="t-label-amber mb-2">Venue host</p>
        <h1 className="t-title">
          {ownedCount > 0 ? 'Manage your venue' : 'Host access'}
        </h1>
        <p className="mt-3 t-body max-w-xl">
          {ownedCount > 0
            ? 'Reservations, availability and payouts for the spaces you host on Cenit.'
            : 'Enter the claim code for your venue to access its host dashboard.'}
        </p>
      </div>
      {ownedCount > 0 && <HostNav />}
      <div className="mt-8">{children}</div>
    </div>
  );
}
