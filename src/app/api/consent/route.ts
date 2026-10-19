import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { getCurrentUser } from '@/lib/firebase/session';
import { OWNER_EMAIL } from '@/lib/email';

// Log a visitor's cookie-consent decision (public). One doc per save.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authUser = await getCurrentUser();

    const ref = await adminDb.collection('consentLogs').add({
      userId: authUser?.uid ?? null,
      functional: Boolean(body.functional),
      analytics: Boolean(body.analytics),
      marketing: Boolean(body.marketing),
      userAgent: request.headers.get('user-agent')?.slice(0, 400) ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to log consent:', error);
    return NextResponse.json({ error: 'Failed to log consent.' }, { status: 500 });
  }
}

// List every consent decision (owner only).
export async function GET() {
  const authUser = await getCurrentUser();
  if (authUser?.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const snap = await adminDb.collection('consentLogs').orderBy('createdAt', 'desc').limit(500).get();
  const logs = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    };
  });
  return NextResponse.json(logs);
}
