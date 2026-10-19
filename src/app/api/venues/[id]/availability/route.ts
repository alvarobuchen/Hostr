import { NextResponse } from 'next/server';
import { getPublicVenue, getUnavailableDates } from '@/lib/firebase/venues';

type RouteContext = { params: Promise<{ id: string }> };

// Public: dates a guest can't book (owner-blocked + already booked).
// Exposes only dates — never claim codes or booking details.
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const venue = await getPublicVenue(id);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    const unavailable = await getUnavailableDates(id);
    // Availability changes the moment a host saves their calendar, so this must
    // never be served from a browser or CDN cache.
    return NextResponse.json(
      { unavailable },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } },
    );
  } catch (error) {
    console.error('Failed to load availability:', error);
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
  }
}
