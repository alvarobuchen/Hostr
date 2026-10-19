import Stripe from 'stripe';

/** Shared Stripe client. Reads the secret key at call time. */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
