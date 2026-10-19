import { getCurrentUser } from '@/lib/firebase/session';
import { listOwnedVenues } from '@/lib/firebase/venues';

// Human-friendly claim-code alphabet: no 0/O/1/I/L to avoid confusion when a
// venue owner types the code we hand them.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Generate a claim code like "CENIT-7Q4K9M" that an owner redeems to bind a venue. */
export function generateClaimCode(): string {
  let body = '';
  for (let i = 0; i < 6; i++) {
    body += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `CENIT-${body}`;
}

/** Normalize user-typed codes (trim, uppercase, collapse spaces). */
export function normalizeClaimCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export type HostSession = {
  userId: string;
  email: string | null;
  name: string | null;
};

/**
 * Returns the current authUser for host pages, or null if not signed in.
 * Pages redirect on null; this keeps the gate logic in one place.
 */
export async function getHostSession(): Promise<HostSession | null> {
  const authUser = await getCurrentUser();
  if (!authUser?.uid) return null;
  return {
    userId: authUser?.uid,
    email: authUser?.email ?? null,
    name: authUser?.name ?? null,
  };
}

/** Venues managed by this host (claimed via code), with add-ons included. */
export function getOwnedVenues(userId: string) {
  return listOwnedVenues(userId);
}
