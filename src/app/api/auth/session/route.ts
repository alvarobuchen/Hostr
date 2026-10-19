// Exchange a Firebase ID token for an httpOnly session cookie (POST), or clear
// it on sign-out (DELETE). Called by the client AuthProvider.
import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, SESSION_COOKIE } from '@/lib/firebase/session';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }
    const { cookie, maxAgeSec } = await createSessionCookie(idToken);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSec,
    });
    return res;
  } catch (error) {
    console.error('Session create error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
