import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getStripeAccountId, setStripeAccountId } from '@/lib/firebase/users';
import { stripe, stripeConfigured } from '@/lib/stripe';

/** Create (or reuse) the user's Express account and return an onboarding link. */
export async function POST(request: NextRequest) {
  try {
    if (!stripeConfigured()) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
    }
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let accountId = await getStripeAccountId(authUser.uid);
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: authUser.email || undefined,
        capabilities: { transfers: { requested: true } },
        business_type: 'individual',
        metadata: { userId: authUser.uid },
      });
      accountId = account.id;
      await setStripeAccountId(authUser.uid, accountId);
    }

    const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/gifts?connect=refresh`,
      return_url: `${baseUrl}/gifts?connect=done`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: link.url });
  } catch (error) {
    console.error('Failed to create account link:', error);
    return NextResponse.json(
      { error: 'Could not start bank onboarding. Make sure Connect is enabled on your Stripe account.' },
      { status: 500 },
    );
  }
}
