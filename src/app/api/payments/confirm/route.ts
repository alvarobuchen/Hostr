import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfigured } from '@/lib/stripe';
import { recordPaidCheckout } from '@/lib/payments';

/**
 * Confirm a Checkout Session from the success redirect.
 *
 * The webhook is the primary path, but it can be missed in local dev (no
 * `stripe listen`) or if the prod endpoint isn't configured — so the success
 * page also calls this. Both share recordPaidCheckout(), which is idempotent.
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripeConfigured()) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(String(sessionId));

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ ok: false, paid: false });
    }

    const { recorded } = await recordPaidCheckout(session);
    return NextResponse.json({ ok: true, paid: true, recorded });
  } catch (error) {
    console.error('Failed to confirm checkout session:', error);
    return NextResponse.json({ error: 'Failed to confirm payment.' }, { status: 500 });
  }
}
