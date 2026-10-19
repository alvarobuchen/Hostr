import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getGiftByCode, addContribution } from '@/lib/firebase/gifts';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    const body = await request.json();
    const { code, guestName, amount } = body;

    if (!code || !guestName || !amount) {
      return NextResponse.json({ error: 'Code, name, and amount are required' }, { status: 400 });
    }

    const gift = await getGiftByCode(String(code));
    if (!gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    if (authUser?.uid && authUser.uid === gift.createdBy) {
      return NextResponse.json(
        {
          error:
            'Organizers cannot use the guest contribution flow. Share the code with invited guests instead.',
        },
        { status: 403 },
      );
    }

    const normalizedAmount = Number(amount);
    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      return NextResponse.json(
        { error: 'Contribution amount must be greater than 0' },
        { status: 400 },
      );
    }

    const id = await addContribution(gift.id, {
      name: guestName,
      amount: normalizedAmount,
      isPaid: true,
    });

    return NextResponse.json(
      { id, amount: normalizedAmount, isPaid: true, user: { name: guestName } },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create contribution:', error);
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 });
  }
}
