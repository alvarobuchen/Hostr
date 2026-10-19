import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { normalizeClaimCode } from '@/lib/host';
import { findVenueByClaimCode, claimVenue } from '@/lib/firebase/venues';
import { setUserRole } from '@/lib/firebase/users';

// Redeem a venue claim code: binds the venue to the signed-in user and
// promotes them to HOST. Codes are single-use (cleared once redeemed).
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const code = normalizeClaimCode(String(body?.code ?? ''));
    if (!code) {
      return NextResponse.json({ error: 'Enter a claim code.' }, { status: 400 });
    }

    const venue = await findVenueByClaimCode(code);
    if (!venue) {
      return NextResponse.json(
        { error: 'That code is not valid or has already been used.' },
        { status: 404 },
      );
    }
    if (venue.data.ownerId) {
      return NextResponse.json({ error: 'This venue has already been claimed.' }, { status: 409 });
    }

    await claimVenue(venue.id, authUser.uid);
    await setUserRole(authUser.uid, 'HOST');

    return NextResponse.json({ ok: true, venueId: venue.id, venueName: venue.data.name });
  } catch (error) {
    console.error('Failed to claim venue:', error);
    return NextResponse.json({ error: 'Failed to claim venue.' }, { status: 500 });
  }
}
