import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { OWNER_EMAIL } from '@/lib/email';
import { listVenuesForAdmin } from '@/lib/firebase/venues';

export const dynamic = 'force-dynamic';

export default async function AdminVenuesPage() {
  const authUser = await getCurrentUser();
  const email = authUser?.email?.toLowerCase();
  const isOwner = !!email && email === OWNER_EMAIL.toLowerCase();

  if (!isOwner) {
    return (
      <div className="wrap page">
        <div className="mx-auto max-w-md card card-p text-center space-y-4">
          <h1 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">Owner access only</h1>
          <p className="t-body">
            Sign in as{' '}
            <span className="font-semibold text-[var(--amber)]">{OWNER_EMAIL}</span>{' '}
            to view venue claim codes.
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <Link href="/login"><button className="btn btn-primary">Sign in</button></Link>
            <Link href="/"><button className="btn btn-ghost">Home</button></Link>
          </div>
        </div>
      </div>
    );
  }

  const venues = await listVenuesForAdmin();

  return (
    <div className="wrap page">
      <div className="mb-8">
        <p className="t-label-amber mb-2">Admin</p>
        <h1 className="t-title">Venue claim codes</h1>
        <p className="mt-3 t-body max-w-xl">
          Share a venue&apos;s code with its owner. When they sign up and enter it at{' '}
          <span className="font-mono text-[var(--ink-1)]">/host</span>, that venue is linked to their
          account and they can manage only it.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-[var(--line)]">
          {venues.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--ink-1)] truncate">{v.name}</p>
                <p className="text-xs text-[var(--ink-3)] mt-0.5 truncate">{v.location}</p>
              </div>
              <div className="shrink-0">
                {v.ownerId ? (
                  <div className="text-right">
                    <span className="badge badge-amber">Claimed</span>
                    <p className="text-xs text-[var(--ink-3)] mt-1">{v.ownerName || 'owner'}</p>
                  </div>
                ) : v.claimCode ? (
                  <code className="rounded-lg border border-[var(--line)] bg-[var(--bg-2)] px-3 py-1.5 text-sm font-semibold tracking-wider text-[var(--ink-1)]">
                    {v.claimCode}
                  </code>
                ) : (
                  <span className="text-xs text-[var(--ink-3)]">code pending — reload /venues</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
