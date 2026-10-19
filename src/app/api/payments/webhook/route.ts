import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { stripe } from '@/lib/stripe';
import { recordPaidCheckout } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe webhook is not configured.' },
        { status: 500 }
      );
    }

    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature.' },
        { status: 400 }
      );
    }

    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      await recordPaidCheckout(event.data.object);
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      await adminDb
        .collection('payments')
        .doc(session.id)
        .set({ status: 'failed', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 400 });
  }
}
