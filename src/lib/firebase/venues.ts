// Firestore data access for venues (server / Admin SDK).
// Collection `venues/{id}` with add-ons embedded; per-venue `blockedDates` and
// `bookings` live in subcollections. Curated demo venues are seeded once.
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './admin';
import { demoVenues } from '@/lib/demo-data';

export type AddOn = { id: string; name: string; description?: string; price: number };

export type PublicVenue = {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  image?: string;
  /** Gallery managed by the host; falls back to `image`, then the branded glyph. */
  images: string[];
  // ── Listing terms the host controls from /host/venues/[id]/edit ──
  /** Floor the estimator never quotes below. Null means no minimum. */
  minPrice: number | null;
  /** Longest bookable event; caps the duration dropdown. */
  maxHours: number;
  /** Drinks-per-person tiers run 1..maxDrinks, then "Barra Libre". */
  maxDrinks: number;
  drinkUnitPrice: number;
  /** Per-guest open-bar rate. Null hides the Barra Libre option. */
  barraLibrePrice: number | null;
  cateringPerGuest: number;
  ownerId?: string | null;
  addOns: AddOn[];
};

// Venues seeded before the listing editor existed have none of these fields,
// so every read fills them in rather than leaking `undefined` into the UI.
export const LISTING_DEFAULTS = {
  maxHours: 9,
  maxDrinks: 6,
  drinkUnitPrice: 6,
  cateringPerGuest: 24,
} as const;

const DEMO_OWNER = 'demo-host';

function makeClaimCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function withAddOnIds(id: string, addOns: { name: string; description?: string; price: number }[]): AddOn[] {
  return addOns.map((a, i) => ({ id: `${id}-add-${i}`, ...a }));
}

/** Seed the curated demo venues on first run (collection empty). Idempotent. */
export async function seedVenuesIfEmpty(): Promise<void> {
  const coll = adminDb.collection('venues');
  const probe = await coll.limit(1).get();
  if (!probe.empty) return;

  const batch = adminDb.batch();
  demoVenues.forEach((v, i) => {
    const ref = coll.doc();
    batch.set(ref, {
      name: v.name,
      description: v.description,
      location: v.location,
      capacity: v.capacity,
      pricePerHour: v.pricePerHour,
      image: v.image ?? null,
      addOns: v.addOns.map((a) => ({ name: a.name, description: a.description ?? null, price: a.price })),
      createdBy: DEMO_OWNER,
      ownerId: null,
      claimCode: makeClaimCode(),
      order: i,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
}

function toPublic(id: string, data: FirebaseFirestore.DocumentData): PublicVenue {
  const images: string[] = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  return {
    id,
    name: data.name,
    description: data.description,
    location: data.location,
    capacity: data.capacity,
    pricePerHour: data.pricePerHour,
    image: data.image ?? undefined,
    // An older doc has no gallery, so fall back to its single cover image.
    images: images.length > 0 ? images : data.image ? [data.image] : [],
    minPrice: typeof data.minPrice === 'number' ? data.minPrice : null,
    maxHours: typeof data.maxHours === 'number' ? data.maxHours : LISTING_DEFAULTS.maxHours,
    maxDrinks: typeof data.maxDrinks === 'number' ? data.maxDrinks : LISTING_DEFAULTS.maxDrinks,
    drinkUnitPrice:
      typeof data.drinkUnitPrice === 'number' ? data.drinkUnitPrice : LISTING_DEFAULTS.drinkUnitPrice,
    barraLibrePrice: typeof data.barraLibrePrice === 'number' ? data.barraLibrePrice : null,
    cateringPerGuest:
      typeof data.cateringPerGuest === 'number' ? data.cateringPerGuest : LISTING_DEFAULTS.cateringPerGuest,
    ownerId: data.ownerId ?? null,
    addOns: withAddOnIds(id, data.addOns ?? []),
  };
}

/** All venues for the public listing, curated demo venues first. */
export async function listPublicVenues(): Promise<PublicVenue[]> {
  await seedVenuesIfEmpty();
  const snap = await adminDb.collection('venues').orderBy('order', 'asc').get();
  return snap.docs.map((d) => toPublic(d.id, d.data()));
}

export async function getPublicVenue(id: string): Promise<PublicVenue | null> {
  const doc = await adminDb.collection('venues').doc(id).get();
  if (!doc.exists) return null;
  return toPublic(doc.id, doc.data()!);
}

/** Dates a guest can't book: owner-blocked + already-booked (today onward). */
export async function getUnavailableDates(venueId: string): Promise<string[]> {
  const today = new Date().toISOString().slice(0, 10);
  const venueRef = adminDb.collection('venues').doc(venueId);

  const [blockedSnap, bookedSnap] = await Promise.all([
    venueRef.collection('blockedDates').where('date', '>=', today).get(),
    venueRef.collection('bookings').where('date', '>=', today).get(),
  ]);

  const dates = new Set<string>();
  blockedSnap.forEach((d) => dates.add(d.get('date')));
  bookedSnap.forEach((d) => {
    if (d.get('status') !== 'cancelled') dates.add(d.get('date'));
  });
  return Array.from(dates).sort();
}

/* ── Raw venue access + booking/host helpers (server) ── */

export type VenueDoc = { id: string; ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData };

export async function getVenueDoc(id: string): Promise<VenueDoc | null> {
  const ref = adminDb.collection('venues').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;
  return { id, ref, data: doc.data()! };
}

export async function findVenueByClaimCode(code: string): Promise<VenueDoc | null> {
  const snap = await adminDb.collection('venues').where('claimCode', '==', code).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ref: d.ref, data: d.data() };
}

/** Bind a venue to a host and consume its claim code. */
export async function claimVenue(venueId: string, uid: string): Promise<void> {
  await adminDb.collection('venues').doc(venueId).update({ ownerId: uid, claimCode: null });
}

/** True if the day (YYYY-MM-DD) is neither blocked nor already booked. */
export async function isDayAvailable(venueId: string, day: string): Promise<boolean> {
  const venueRef = adminDb.collection('venues').doc(venueId);
  const [blocked, booked] = await Promise.all([
    venueRef.collection('blockedDates').where('date', '==', day).limit(1).get(),
    venueRef.collection('bookings').where('date', '==', day).get(),
  ]);
  if (!blocked.empty) return false;
  return booked.docs.every((d) => d.get('status') === 'cancelled');
}

export async function createBooking(
  venueId: string,
  b: { userId: string; userName?: string | null; date: string; duration: number; totalPrice: number; status?: string },
): Promise<string> {
  const ref = await adminDb.collection('venues').doc(venueId).collection('bookings').add({
    userId: b.userId,
    userName: b.userName ?? null,
    date: b.date,
    duration: b.duration,
    totalPrice: b.totalPrice,
    status: b.status ?? 'confirmed',
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

/** Venues managed by a host (claimed). */
export async function listOwnedVenues(uid: string): Promise<PublicVenue[]> {
  const snap = await adminDb.collection('venues').where('ownerId', '==', uid).get();
  return snap.docs
    .map((d) => toPublic(d.id, d.data()))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** All venues with owner + claim-code info, for the admin console. */
export async function listVenuesForAdmin(): Promise<
  { id: string; name: string; location: string; claimCode: string | null; ownerId: string | null; ownerName: string | null }[]
> {
  const snap = await adminDb.collection('venues').orderBy('order', 'asc').get();
  return Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();
      let ownerName: string | null = null;
      if (data.ownerId) {
        const owner = await adminDb.collection('users').doc(data.ownerId).get();
        ownerName = (owner.get('name') as string) || (owner.get('email') as string) || null;
      }
      return {
        id: d.id,
        name: data.name,
        location: data.location,
        claimCode: (data.claimCode as string) ?? null,
        ownerId: (data.ownerId as string) ?? null,
        ownerName,
      };
    }),
  );
}

/** The host's owner Stripe account id, if any (from users/{ownerId}). */
export async function getVenueOwnerStripeAccount(ownerId: string | null | undefined): Promise<string | null> {
  if (!ownerId) return null;
  const snap = await adminDb.collection('users').doc(ownerId).get();
  return (snap.get('stripeAccountId') as string | undefined) ?? null;
}

/* ── Availability management (host) ── */

export async function listBlockedDates(venueId: string): Promise<string[]> {
  const snap = await adminDb.collection('venues').doc(venueId).collection('blockedDates').get();
  return snap.docs.map((d) => d.get('date') as string).sort();
}

export async function setBlockedDate(venueId: string, day: string, blocked: boolean): Promise<void> {
  const col = adminDb.collection('venues').doc(venueId).collection('blockedDates');
  const existing = await col.where('date', '==', day).get();
  if (blocked && existing.empty) {
    await col.add({ date: day, createdAt: FieldValue.serverTimestamp() });
  } else if (!blocked && !existing.empty) {
    await Promise.all(existing.docs.map((d) => d.ref.delete()));
  }
}

/**
 * Replace a venue's blocked dates with exactly `days`, in one batch.
 *
 * The host calendar stages edits locally and commits them here, so the whole
 * change lands at once — guests never observe a half-applied calendar.
 * Returns the days actually stored.
 */
export async function setBlockedDates(venueId: string, days: string[]): Promise<string[]> {
  const venueRef = adminDb.collection('venues').doc(venueId);
  const col = venueRef.collection('blockedDates');

  // Days already taken by a live booking aren't the host's to block or free.
  const bookedSnap = await venueRef.collection('bookings').get();
  const booked = new Set<string>();
  bookedSnap.forEach((d) => {
    if (d.get('status') !== 'cancelled') booked.add(d.get('date') as string);
  });

  const keep = Array.from(new Set(days.filter((d) => !booked.has(d)))).sort();

  const existing = await col.get();
  const batch = adminDb.batch();
  existing.docs.forEach((d) => batch.delete(d.ref));
  keep.forEach((date) => {
    batch.set(col.doc(), { date, createdAt: FieldValue.serverTimestamp() });
  });
  await batch.commit();

  return keep;
}

/** Fields a host may change on their listing. Undefined keys are left alone. */
export type VenueListingUpdate = {
  name?: string;
  description?: string;
  location?: string;
  capacity?: number;
  pricePerHour?: number;
  images?: string[];
  minPrice?: number | null;
  maxHours?: number;
  maxDrinks?: number;
  drinkUnitPrice?: number;
  barraLibrePrice?: number | null;
  cateringPerGuest?: number;
  addOns?: { name: string; description?: string | null; price: number }[];
};

/** Persist a host's listing edits. Add-ons are stored embedded on the doc. */
export async function updateVenueListing(venueId: string, patch: VenueListingUpdate): Promise<void> {
  const data: FirebaseFirestore.DocumentData = {};

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    data[key] = value;
  }

  // Keep the legacy single `image` in step with the gallery's cover shot so
  // listing cards and older reads stay correct.
  if (patch.images) {
    data.image = patch.images[0] ?? null;
  }

  if (Object.keys(data).length === 0) return;
  data.updatedAt = FieldValue.serverTimestamp();

  await adminDb.collection('venues').doc(venueId).update(data);
}

/** Confirmed/pending bookings for a set of venues (host reservations view). */
export async function listBookingsForVenues(
  venues: { id: string; name: string }[],
): Promise<
  { id: string; venueId: string; venueName: string; userName: string; date: string; duration: number; totalPrice: number; status: string }[]
> {
  const results = await Promise.all(
    venues.map(async (v) => {
      const snap = await adminDb.collection('venues').doc(v.id).collection('bookings').get();
      return snap.docs.map((d) => ({
        id: d.id,
        venueId: v.id,
        venueName: v.name,
        userName: (d.get('userName') as string) || 'Guest',
        date: d.get('date'),
        duration: d.get('duration'),
        totalPrice: d.get('totalPrice'),
        status: d.get('status'),
      }));
    }),
  );
  return results.flat().sort((a, b) => a.date.localeCompare(b.date));
}
