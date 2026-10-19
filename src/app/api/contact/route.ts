import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { getCurrentUser } from '@/lib/firebase/session';
import { sendContactNotification, OWNER_EMAIL } from '@/lib/email';

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

async function requireOwner() {
  const authUser = await getCurrentUser();
  return authUser?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

// Submit a contact message (public): persist + email the owner.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const subject = String(body.subject ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
    }

    const ref = await adminDb.collection('contactMessages').add({
      name,
      email,
      subject,
      message,
      handled: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Email is best-effort — a delivery failure shouldn't lose the saved message.
    void sendContactNotification({ name, email, subject, message });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit contact message:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}

// List messages (owner only).
export async function GET() {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const snap = await adminDb.collection('contactMessages').orderBy('createdAt', 'desc').get();
  const messages = snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.().toISOString() ?? null };
  });
  return NextResponse.json(messages);
}

// Mark a message handled / unhandled (owner only).
export async function PATCH(request: NextRequest) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id, handled } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await adminDb.collection('contactMessages').doc(String(id)).set(
    { handled: Boolean(handled) },
    { merge: true },
  );
  return NextResponse.json({ id, handled: Boolean(handled) });
}
