import type Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { addContribution } from '@/lib/firebase/gifts';
import { createFourvenuesTicket } from '@/lib/fourvenues';

/**
 * Atomically claim a Stripe checkout session so completion runs exactly once,
 * even if the webhook and the success-page confirm both fire. Returns true to
 * the single winner. State lives in `payments/{sessionId}`.
 */
async function claimSession(
  sessionId: string,
  patch: Record<string, unknown>,
): Promise<boolean> {
  const ref = adminDb.collection('payments').doc(sessionId);
  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (doc.exists && doc.get('status') === 'succeeded') return false;
    tx.set(ref, { ...patch, status: 'succeeded', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return true;
  });
}

/**
 * Record a completed Checkout Session as a paid gift contribution — or, for a
 * venue-booking deposit, a confirmed booking. Idempotent across webhook + confirm.
 */
export async function recordPaidCheckout(
  session: Stripe.Checkout.Session,
): Promise<{ recorded: boolean }> {
  if (session.metadata?.kind === 'venue_booking') {
    return recordPaidBooking(session);
  }

  const giftId = session.metadata?.giftId;
  const guestName = session.metadata?.guestName;
  const amount = Number(session.metadata?.amount || 0);
  const totalAmount = Number(session.metadata?.totalAmount || amount);
  const currency = (session.metadata?.currency || 'USD').toUpperCase();
  const addClubTicket = session.metadata?.addClubTicket === 'true';
  const ticketType = session.metadata?.ticketType || null;
  const paymentIntentId = session.payment_intent ? String(session.payment_intent) : null;

  if (!giftId || !guestName || !(amount > 0)) return { recorded: false };

  const won = await claimSession(session.id, {
    kind: 'gift_contribution',
    giftId,
    amount: totalAmount,
    currency,
    stripePaymentId: paymentIntentId,
  });
  if (!won) return { recorded: false };

  await addContribution(giftId, {
    name: guestName,
    amount,
    isPaid: true,
    paymentId: paymentIntentId,
    addClubTicket,
    ticketType,
  });

  if (addClubTicket && ticketType === 'Shoko') {
    const fourvenues = await createFourvenuesTicket({
      guestName,
      guestEmail: `guest-${giftId}-${Date.now()}@cenit.app`,
      clubName: ticketType,
      ticketType: 'afterparty',
      quantity: 1,
      referenceCode: String(session.id),
    });
    if (!fourvenues.ok) console.error('Fourvenues ticket creation failed:', fourvenues);
  }

  return { recorded: true };
}

/** Record a paid venue-booking deposit as a confirmed booking. */
async function recordPaidBooking(
  session: Stripe.Checkout.Session,
): Promise<{ recorded: boolean }> {
  const venueId = session.metadata?.venueId;
  const userId = session.metadata?.userId;
  const dayStr = session.metadata?.date;
  const hours = Number(session.metadata?.hours || 0);
  const total = Number(session.metadata?.total || 0);
  const paymentIntentId = session.payment_intent ? String(session.payment_intent) : null;

  if (!venueId || !userId || !dayStr || !(hours > 0)) return { recorded: false };

  const won = await claimSession(session.id, {
    kind: 'venue_booking',
    venueId,
    userId,
    stripePaymentId: paymentIntentId,
  });
  if (!won) return { recorded: false };

  await adminDb.collection('venues').doc(venueId).collection('bookings').add({
    userId,
    userName: session.metadata?.userName || null,
    date: dayStr, // 'YYYY-MM-DD'
    duration: hours,
    totalPrice: total,
    status: 'confirmed',
    createdAt: FieldValue.serverTimestamp(),
  });

  return { recorded: true };
}
