import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import {
  getVenueDoc,
  getUnavailableDates,
  listBlockedDates,
  setBlockedDate,
  setBlockedDates,
} from '@/lib/firebase/venues';

const isDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

/** Confirm the signed-in user owns this venue; returns it or a NextResponse error. */
async function requireOwnedVenue(venueId: string | null) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!venueId) {
    return { error: NextResponse.json({ error: 'Missing venueId' }, { status: 400 }) };
  }
  const venue = await getVenueDoc(venueId);
  if (!venue || venue.data.ownerId !== authUser.uid) {
    return { error: NextResponse.json({ error: 'Venue not found' }, { status: 404 }) };
  }
  return { venue };
}

// List blocked + already-booked dates for a venue the host owns.
export async function GET(request: NextRequest) {
  const venueId = request.nextUrl.searchParams.get('venueId');
  const { error, venue } = await requireOwnedVenue(venueId);
  if (error) return error;

  const [blocked, unavailable] = await Promise.all([
    listBlockedDates(venue!.id),
    getUnavailableDates(venue!.id),
  ]);
  // `unavailable` includes blocked + booked; booked = unavailable minus blocked.
  const blockedSet = new Set(blocked);
  const booked = unavailable.filter((d) => !blockedSet.has(d));

  return NextResponse.json({ blocked, booked });
}

// Block a date.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { error, venue } = await requireOwnedVenue(body?.venueId ?? null);
  if (error) return error;

  const date = String(body?.date ?? '');
  if (!isDay(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  await setBlockedDate(venue!.id, date, true);
  return NextResponse.json({ ok: true });
}

/**
 * Replace the venue's blocked dates with exactly the list supplied.
 *
 * The host calendar stages edits locally and commits them here, so the whole
 * change lands in one batch — guests never observe a half-applied calendar,
 * and a failure leaves the previous state untouched.
 */
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { error, venue } = await requireOwnedVenue(body?.venueId ?? null);
  if (error) return error;

  if (!Array.isArray(body?.blocked)) {
    return NextResponse.json({ error: 'Expected a blocked date list.' }, { status: 400 });
  }

  const days = (body.blocked as unknown[]).map(String);
  const invalid = days.find((d) => !isDay(d));
  if (invalid) {
    return NextResponse.json({ error: `Invalid date: ${invalid}` }, { status: 400 });
  }

  try {
    const blocked = await setBlockedDates(venue!.id, days);
    return NextResponse.json({ ok: true, blocked });
  } catch (err) {
    console.error('Failed to save availability:', err);
    return NextResponse.json({ error: 'Could not save your calendar.' }, { status: 500 });
  }
}

// Unblock a date.
export async function DELETE(request: NextRequest) {
  const venueId = request.nextUrl.searchParams.get('venueId');
  const { error, venue } = await requireOwnedVenue(venueId);
  if (error) return error;

  const date = request.nextUrl.searchParams.get('date') ?? '';
  if (!isDay(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  await setBlockedDate(venue!.id, date, false);
  return NextResponse.json({ ok: true });
}
