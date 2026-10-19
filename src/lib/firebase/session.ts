// Server-side session handling with Firebase session cookies.
//
// Flow: the browser signs in with the Firebase Web SDK, gets an ID token, and
// POSTs it to /api/auth/session. We verify it and mint an httpOnly **session
// cookie** (Admin SDK). Server components + API routes then read that cookie to
// know who's signed in — the server-side replacement for NextAuth's session.
import { cookies } from 'next/headers';
import { adminAuth } from './admin';
import { ensureUserDoc, getUserRole, type Role } from './users';

export const SESSION_COOKIE = '__session';
const EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export type CurrentUser = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  role: Role;
};

/** Verify a fresh ID token and return a session cookie value to set. */
export async function createSessionCookie(idToken: string): Promise<{ cookie: string; maxAgeSec: number }> {
  const decoded = await adminAuth.verifyIdToken(idToken);
  // Make sure the Firestore user doc + default role claim exist.
  await ensureUserDoc({
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name as string | undefined,
    picture: decoded.picture,
  });
  const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN_MS });
  return { cookie, maxAgeSec: EXPIRES_IN_MS / 1000 };
}

/** The signed-in user for the current request, or null. Use in server
 *  components and API routes. Role comes from the token claim when present,
 *  else Firestore (so freshly-promoted hosts are recognized immediately). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(value, true);
    const claimRole = decoded.role as Role | undefined;
    const role = claimRole ?? (await getUserRole(decoded.uid));
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: (decoded.name as string | undefined) ?? null,
      picture: (decoded.picture as string | undefined) ?? null,
      role,
    };
  } catch {
    // Expired / revoked / invalid cookie.
    return null;
  }
}

/** Convenience for API routes that must be authenticated. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}
