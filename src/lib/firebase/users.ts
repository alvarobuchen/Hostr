// Server-side user + role helpers (Admin SDK). Roles live in two places that
// stay in sync: a Firebase Auth custom claim (fast, travels in the token) and
// the Firestore `users/{uid}` document (queryable, source of truth).
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from './admin';

export type Role = 'GUEST' | 'HOST' | 'ADMIN';

type BasicUser = {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
};

/** Create the Firestore user doc + default GUEST claim on first sign-in.
 *  Returns the user's current role. */
export async function ensureUserDoc(u: BasicUser): Promise<Role> {
  const ref = adminDb.collection('users').doc(u.uid);
  const snap = await ref.get();

  if (snap.exists) {
    return ((snap.get('role') as Role) || 'GUEST');
  }

  const role: Role = 'GUEST';
  await ref.set({
    email: u.email ?? null,
    name: u.name ?? null,
    image: u.picture ?? null,
    role,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await adminAuth.setCustomUserClaims(u.uid, { role });
  return role;
}

/** Read a user's role from Firestore (source of truth). */
export async function getUserRole(uid: string): Promise<Role> {
  const snap = await adminDb.collection('users').doc(uid).get();
  return ((snap.get('role') as Role) || 'GUEST');
}

/** Promote/demote a user — updates both the claim and the Firestore doc. */
export async function setUserRole(uid: string, role: Role): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, { role });
  await adminDb
    .collection('users')
    .doc(uid)
    .set({ role, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

/** The user's Stripe Connect account id (for payouts), if any. */
export async function getStripeAccountId(uid: string): Promise<string | null> {
  const snap = await adminDb.collection('users').doc(uid).get();
  return (snap.get('stripeAccountId') as string | undefined) ?? null;
}

export async function setStripeAccountId(uid: string, accountId: string): Promise<void> {
  await adminDb
    .collection('users')
    .doc(uid)
    .set({ stripeAccountId: accountId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}
