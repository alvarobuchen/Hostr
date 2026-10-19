import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getStripeAccountId } from '@/lib/firebase/users';
import { stripe, stripeConfigured } from '@/lib/stripe';

/** Withdraw the connected account's available balance to its bank. */
export async function POST() {
  try {
    if (!stripeConfigured()) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
    }
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeAccountId = await getStripeAccountId(authUser.uid);
    if (!stripeAccountId) {
      return NextResponse.json({ error: 'No connected account. Connect a bank account first.' }, { status: 400 });
    }

    const acct = await stripe.accounts.retrieve(stripeAccountId);
    if (!acct.payouts_enabled) {
      return NextResponse.json({ error: 'Finish bank onboarding before withdrawing.' }, { status: 400 });
    }

    const balance = await stripe.balance.retrieve({}, { stripeAccount: stripeAccountId });
    const available = balance.available.filter((b) => b.amount > 0);

    if (available.length === 0) {
      return NextResponse.json({
        ok: false,
        message: 'No funds available to withdraw yet — they become available once Stripe finishes processing recent payments.',
      });
    }

    const payouts = [];
    for (const b of available) {
      const payout = await stripe.payouts.create(
        { amount: b.amount, currency: b.currency },
        { stripeAccount: stripeAccountId },
      );
      payouts.push({ id: payout.id, amount: b.amount / 100, currency: b.currency.toUpperCase() });
    }

    return NextResponse.json({ ok: true, payouts });
  } catch (error) {
    console.error('Failed to create payout:', error);
    return NextResponse.json({ error: 'Could not start the withdrawal.' }, { status: 500 });
  }
}
