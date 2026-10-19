import { NextResponse } from 'next/server';
import { getPublicVenue } from '@/lib/firebase/venues';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const venue = await getPublicVenue(id);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    return NextResponse.json(venue);
  } catch (error) {
    console.error('Failed to fetch venue:', error);
    return NextResponse.json({ error: 'Failed to fetch venue' }, { status: 500 });
  }
}
