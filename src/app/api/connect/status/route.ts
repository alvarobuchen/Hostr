import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getStripeAccountId } from '@/lib/firebase/users';
import { stripe, stripeConfigured } from '@/lib/stripe';

/** Onboarding + balance status for the current user's connected account. */
export async function GET() {
  try {
    if (!stripeConfigured()) {
      return NextResponse.json({ configured: false, connected: false });
    }
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeAccountId = await getStripeAccountId(authUser.uid);
    if (!stripeAccountId) {
      return NextResponse.json({ configured: true, connected: false });
    }

    const acct = await stripe.accounts.retrieve(stripeAccountId);
    const balance = await stripe.balance.retrieve({}, { stripeAccount: stripeAccountId });
    const available = balance.available.reduce((s, b) => s + b.amount, 0) / 100;
    const pending = balance.pending.reduce((s, b) => s + b.amount, 0) / 100;
    const currency = (balance.available[0]?.currency || balance.pending[0]?.currency || 'usd').toUpperCase();

    let dashboardUrl: string | null = null;
    if (acct.payouts_enabled) {
      try {
        const link = await stripe.accounts.createLoginLink(stripeAccountId);
        dashboardUrl = link.url;
      } catch { /* express dashboard not available yet */ }
    }

    return NextResponse.json({
      configured: true,
      connected: true,
      chargesEnabled: acct.charges_enabled,
      payoutsEnabled: acct.payouts_enabled,
      detailsSubmitted: acct.details_submitted,
      available,
      pending,
      currency,
      dashboardUrl,
    });
  } catch (error) {
    console.error('Failed to load connect status:', error);
    return NextResponse.json({ configured: true, connected: true, error: true, payoutsEnabled: false });
  }
}
