import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { OWNER_EMAIL } from '@/lib/email';
import { adminDb } from '@/lib/firebase/admin';
import { MessagesInbox } from './inbox';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
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
            to view contact messages.
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <Link href="/login"><button className="btn btn-primary">Sign in</button></Link>
            <Link href="/"><button className="btn btn-ghost">Home</button></Link>
          </div>
        </div>
      </div>
    );
  }

  const snap = await adminDb.collection('contactMessages').orderBy('createdAt', 'desc').get();
  const initial = snap.docs.map((d) => {
    const m = d.data();
    return {
      id: d.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      handled: !!m.handled,
      createdAt: m.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    };
  });

  return (
    <div className="wrap page">
      <MessagesInbox initial={initial} />
    </div>
  );
}
