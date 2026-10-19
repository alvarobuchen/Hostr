import { NextRequest, NextResponse } from 'next/server';
import { getGiftMetaByCode } from '@/lib/firebase/gifts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name } = body;

    if (!code) {
      return NextResponse.json({ error: 'Gift code is required' }, { status: 400 });
    }

    const gift = await getGiftMetaByCode(String(code));
    if (!gift) {
      return NextResponse.json({ error: 'Invalid gift code' }, { status: 404 });
    }
    if (gift.status !== 'open') {
      return NextResponse.json(
        { error: 'This gift is no longer accepting contributions' },
        { status: 400 },
      );
    }

    // Gift is valid — the client redirects to the gift page with the code.
    return NextResponse.json(
      { message: 'Gift code verified', giftId: gift.id, guestName: name || 'Guest' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json({ error: 'Failed to verify gift code' }, { status: 500 });
  }
}
