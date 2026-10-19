import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/firebase/session';
import { createGift, getGiftByCode, listGiftsByCreator } from '@/lib/firebase/gifts';

// Get gifts — a single one by code (public), or the signed-in user's own.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const gift = await getGiftByCode(code);
      if (!gift) {
        return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
      }
      return NextResponse.json(gift);
    }

    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gifts = await listGiftsByCreator(authUser.uid);
    return NextResponse.json(gifts);
  } catch (error) {
    console.error('Failed to fetch gifts:', error);
    return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 });
  }
}

// Create a new gift.
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      totalPrice,
      currency = 'USD',
      participantCount,
      eventDate,
      clubName,
      clubTicketPrice,
      clubTotalTickets,
    } = body;

    if (!title || !totalPrice || !participantCount || !eventDate) {
      return NextResponse.json({ error: 'Missing required gift details' }, { status: 400 });
    }

    const isoEventDate = new Date(eventDate).toISOString();
    const club =
      clubName && clubTicketPrice
        ? {
            clubName,
            ticketPrice: Number(clubTicketPrice),
            totalTickets: Number(clubTotalTickets || participantCount),
            availableTickets: Number(clubTotalTickets || participantCount),
            date: isoEventDate,
          }
        : null;

    const gift = await createGift({
      title,
      description: description ?? null,
      totalPrice: Number(totalPrice),
      currency,
      participantCount: Number(participantCount),
      eventDate: isoEventDate,
      code: nanoid(8).toUpperCase(),
      createdBy: authUser.uid,
      creatorName: authUser.name,
      club,
    });

    return NextResponse.json(gift, { status: 201 });
  } catch (error) {
    console.error('Failed to create gift:', error);
    return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 });
  }
}
