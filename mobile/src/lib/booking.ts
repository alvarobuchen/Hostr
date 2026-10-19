// Shared booking math so the venue page and the booking API always agree.

/** Deposit charged up front to secure a date (the rest is settled with the venue). */
export const DEPOSIT_RATE = 0.2;

// Per-guest rates used by the live estimator.
export const DRINK_UNIT_PRICE = 6; // per drink
export const CATERING_PER_GUEST = 24;

export type EstimateInput = {
  pricePerHour: number;
  hours: number;
  attendees: number;
  drinksPerPerson: number;
  catering: boolean;
  addOnsTotal: number;
};

export type Estimate = {
  base: number;
  drinks: number;
  catering: number;
  extras: number;
  total: number;
  deposit: number;
};

export function computeEstimate(i: EstimateInput): Estimate {
  const base = i.pricePerHour * i.hours;
  const drinks = i.attendees * i.drinksPerPerson * DRINK_UNIT_PRICE;
  const catering = i.catering ? i.attendees * CATERING_PER_GUEST : 0;
  const extras = i.addOnsTotal;
  const total = base + drinks + catering + extras;
  const deposit = Math.round(total * DEPOSIT_RATE);
  return { base, drinks, catering, extras, total, deposit };
}
