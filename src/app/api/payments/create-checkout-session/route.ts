import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { getGiftMetaByCode } from '@/lib/firebase/gifts';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 500 });
    }

    const body = await request.json();
    const { code, guestName, amount, addClubTicket = false } = body;

    if (!code || !guestName || !amount) {
      return NextResponse.json(
        { error: 'Gift code, guest name, and amount are required.' },
        { status: 400 },
      );
    }

    const contributionAmount = Number(amount);
    if (Number.isNaN(contributionAmount) || contributionAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero.' }, { status: 400 });
    }

    const gift = await getGiftMetaByCode(String(code));
    if (!gift) {
      return NextResponse.json({ error: 'Gift not found.' }, { status: 404 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    const afterpartyPrice = addClubTicket && gift.club ? Number(gift.club.ticketPrice) : 0;
    const totalAmount = contributionAmount + afterpartyPrice;

    // Route funds to the gift creator's connected account, if onboarded.
    let transferDestination: string | null = null;
    const creatorSnap = await adminDb.collection('users').doc(gift.createdBy).get();
    const stripeAccountId = creatorSnap.get('stripeAccountId') as string | undefined;
    if (stripeAccountId) {
      try {
        const acct = await stripe.accounts.retrieve(stripeAccountId);
        if (acct.charges_enabled && acct.payouts_enabled) {
          transferDestination = stripeAccountId;
        }
      } catch (e) {
        console.error('Could not verify connected account; keeping funds on platform.', e);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${baseUrl}/gift/${gift.code}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/gift/${gift.code}?checkout=cancel`,
      customer_creation: 'always',
      ...(transferDestination
        ? { payment_intent_data: { transfer_data: { destination: transferDestination } } }
        : {}),
      line_items: [
        {
          price_data: {
            currency: gift.currency.toLowerCase(),
            product_data: {
              name: `Contribution for ${gift.title}`,
              description:
                addClubTicket && gift.club
                  ? `Gift code ${gift.code} + ${gift.club.clubName} afterparty ticket`
                  : `Gift code ${gift.code}`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        giftId: gift.id,
        giftCode: gift.code,
        guestName,
        amount: contributionAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        currency: gift.currency,
        addClubTicket: addClubTicket ? 'true' : 'false',
        ticketType: gift.club?.clubName || '',
        ticketPrice: afterpartyPrice ? afterpartyPrice.toFixed(2) : '0',
      },
    });

    // Track the pending payment so completion can be claimed exactly once.
    await adminDb.collection('payments').doc(session.id).set({
      kind: 'gift_contribution',
      amount: totalAmount,
      currency: gift.currency,
      status: 'pending',
      giftId: gift.id,
      giftCode: gift.code,
      guestName,
      addClubTicket,
      ticketType: gift.club?.clubName || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
