// Shared booking math so the venue page and the booking API always agree.

/** Deposit charged up front to secure a date (the rest is settled with the venue). */
export const DEPOSIT_RATE = 0.2;

// Fallback rates for venues created before hosts could set their own.
export const DRINK_UNIT_PRICE = 6; // per drink
export const CATERING_PER_GUEST = 24;

/** Sentinel for the open-bar tier that sits after the numbered drink options. */
export const BARRA_LIBRE = 'barra';
export type DrinksChoice = number | typeof BARRA_LIBRE;

export type EstimateInput = {
  pricePerHour: number;
  hours: number;
  attendees: number;
  /** A drinks-per-person count, or BARRA_LIBRE for open bar. */
  drinksPerPerson: DrinksChoice;
  catering: boolean;
  addOnsTotal: number;
  // Per-venue overrides; omitted values fall back to the constants above.
  drinkUnitPrice?: number;
  barraLibrePrice?: number | null;
  cateringPerGuest?: number;
  /** Floor the quote never drops below, whatever the guest picks. */
  minPrice?: number | null;
};

export type Estimate = {
  base: number;
  drinks: number;
  catering: number;
  extras: number;
  subtotal: number;
  /** Amount added to reach the venue's minimum price, if any. */
  minimumTopUp: number;
  total: number;
  deposit: number;
};

export function computeEstimate(i: EstimateInput): Estimate {
  const drinkRate = i.drinkUnitPrice ?? DRINK_UNIT_PRICE;
  const cateringRate = i.cateringPerGuest ?? CATERING_PER_GUEST;

  const base = i.pricePerHour * i.hours;

  // Open bar is a flat per-guest rate; anything else is count × unit price.
  const drinks =
    i.drinksPerPerson === BARRA_LIBRE
      ? i.attendees * (i.barraLibrePrice ?? 0)
      : i.attendees * i.drinksPerPerson * drinkRate;

  const catering = i.catering ? i.attendees * cateringRate : 0;
  const extras = i.addOnsTotal;

  const subtotal = base + drinks + catering + extras;
  const minimumTopUp = i.minPrice && subtotal < i.minPrice ? i.minPrice - subtotal : 0;

  const total = subtotal + minimumTopUp;
  const deposit = Math.round(total * DEPOSIT_RATE);

  return { base, drinks, catering, extras, subtotal, minimumTopUp, total, deposit };
}
