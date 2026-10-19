import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { getCurrentUser } from '@/lib/firebase/session';
import {
  getVenueDoc,
  isDayAvailable,
  createBooking,
  getVenueOwnerStripeAccount,
} from '@/lib/firebase/venues';
import { stripe, stripeConfigured } from '@/lib/stripe';
import { BARRA_LIBRE, computeEstimate, type DrinksChoice } from '@/lib/booking';

const isDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// Create a venue booking. Charges a deposit via Stripe when configured
// (routed to the venue's connected account if onboarded, else held on the
// platform); otherwise books directly with no payment.
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Please sign in to reserve.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const day = String(body?.date ?? '');
    const hours = Math.max(1, Math.min(24, Number(body?.hours) || 0));
    const attendees = Math.max(1, Number(body?.attendees) || 0);
    // Guests send either a drink count or the open-bar sentinel.
    const drinksPerPerson: DrinksChoice =
      body?.drinksPerPerson === BARRA_LIBRE
        ? BARRA_LIBRE
        : Math.max(0, Number(body?.drinksPerPerson) || 0);
    const catering = Boolean(body?.catering);

    if (!body?.venueId || !isDay(day)) {
      return NextResponse.json({ error: 'Pick a venue and a valid date.' }, { status: 400 });
    }
    const today = new Date().toISOString().slice(0, 10);
    if (day < today) {
      return NextResponse.json({ error: 'That date is in the past.' }, { status: 400 });
    }

    const venue = await getVenueDoc(String(body.venueId));
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found.' }, { status: 404 });
    }

    if (!(await isDayAvailable(venue.id, day))) {
      return NextResponse.json({ error: 'That date is no longer available.' }, { status: 409 });
    }

    const addOnsTotal = ((venue.data.addOns as { price: number }[]) ?? []).reduce((s, a) => s + a.price, 0);
    const est = computeEstimate({
      pricePerHour: venue.data.pricePerHour,
      hours,
      attendees,
      drinksPerPerson,
      catering,
      addOnsTotal,
      // Honour the host's own rates rather than the platform defaults.
      drinkUnitPrice: venue.data.drinkUnitPrice,
      barraLibrePrice: venue.data.barraLibrePrice ?? null,
      cateringPerGuest: venue.data.cateringPerGuest,
      minPrice: venue.data.minPrice ?? null,
    });

    // ── No Stripe: book directly, no payment ──────────────────────────
    if (!stripeConfigured()) {
      const bookingId = await createBooking(venue.id, {
        userId: authUser.uid,
        userName: authUser.name,
        date: day,
        duration: hours,
        totalPrice: est.total,
        status: 'confirmed',
      });
      return NextResponse.json({ booked: true, bookingId });
    }

    // ── Stripe: charge the deposit via Checkout ───────────────────────
    let transferDestination: string | null = null;
    const ownerStripe = await getVenueOwnerStripeAccount(venue.data.ownerId);
    if (ownerStripe) {
      try {
        const acct = await stripe.accounts.retrieve(ownerStripe);
        if (acct.charges_enabled && acct.payouts_enabled) {
          transferDestination = ownerStripe;
        }
      } catch (e) {
        console.error('Could not verify venue connected account; holding on platform.', e);
      }
    }

    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${baseUrl}/venues/${venue.id}?booking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/venues/${venue.id}?booking=cancel`,
      customer_creation: 'always',
      ...(transferDestination
        ? { payment_intent_data: { transfer_data: { destination: transferDestination } } }
        : {}),
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Deposit — ${venue.data.name}`,
              description: `${day} · ${hours}h · ${attendees} guests (20% of $${est.total})`,
            },
            unit_amount: Math.round(est.deposit * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: 'venue_booking',
        venueId: venue.id,
        userId: authUser.uid,
        userName: authUser.name || '',
        date: day,
        hours: String(hours),
        total: est.total.toFixed(2),
        deposit: est.deposit.toFixed(2),
      },
    });

    await adminDb.collection('payments').doc(checkout.id).set({
      kind: 'venue_booking',
      amount: est.deposit,
      currency: 'EUR',
      status: 'pending',
      venueId: venue.id,
      date: day,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ error: 'Failed to create booking.' }, { status: 500 });
  }
}
