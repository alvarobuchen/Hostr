import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import {
  getVenueDoc,
  getPublicVenue,
  updateVenueListing,
  type VenueListingUpdate,
} from '@/lib/firebase/venues';

type RouteContext = { params: Promise<{ id: string }> };

/** Confirm the signed-in user owns this venue; returns it or a NextResponse error. */
async function requireOwnedVenue(venueId: string) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const venue = await getVenueDoc(venueId);
  // Same 404 for "missing" and "not yours" so we never confirm a venue exists
  // to someone who doesn't host it.
  if (!venue || venue.data.ownerId !== authUser.uid) {
    return { error: NextResponse.json({ error: 'Venue not found' }, { status: 404 }) };
  }
  return { venue };
}

// ── Field coercion ──
// Each returns `undefined` when the key is absent, so a PATCH only touches what
// it actually sends. `null` is meaningful for the optional money fields.

function str(v: unknown): string | undefined {
  return v === undefined ? undefined : String(v).trim();
}

function num(v: unknown): number | undefined {
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Optional money field: '' / null clears it, a number sets it. */
function optionalMoney(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { error } = await requireOwnedVenue(id);
  if (error) return error;

  const venue = await getPublicVenue(id);
  return NextResponse.json(venue);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { error, venue } = await requireOwnedVenue(id);
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const patch: VenueListingUpdate = {};
  const problems: string[] = [];

  const name = str(body.name);
  if (name !== undefined) {
    if (!name) problems.push('Name cannot be empty.');
    else patch.name = name;
  }

  const description = str(body.description);
  if (description !== undefined) {
    if (description.length < 20) problems.push('Description must be at least 20 characters.');
    else patch.description = description;
  }

  const location = str(body.location);
  if (location !== undefined) {
    if (!location) problems.push('Location cannot be empty.');
    else patch.location = location;
  }

  const capacity = num(body.capacity);
  if (capacity !== undefined) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      problems.push('Capacity must be a whole number of at least 1.');
    } else patch.capacity = capacity;
  }

  const pricePerHour = num(body.pricePerHour);
  if (pricePerHour !== undefined) {
    if (pricePerHour < 0) problems.push('Price per hour cannot be negative.');
    else patch.pricePerHour = pricePerHour;
  }

  const maxHours = num(body.maxHours);
  if (maxHours !== undefined) {
    if (!Number.isInteger(maxHours) || maxHours < 1 || maxHours > 24) {
      problems.push('Maximum hours must be a whole number between 1 and 24.');
    } else patch.maxHours = maxHours;
  }

  const maxDrinks = num(body.maxDrinks);
  if (maxDrinks !== undefined) {
    if (!Number.isInteger(maxDrinks) || maxDrinks < 0 || maxDrinks > 20) {
      problems.push('Maximum drinks must be a whole number between 0 and 20.');
    } else patch.maxDrinks = maxDrinks;
  }

  const drinkUnitPrice = num(body.drinkUnitPrice);
  if (drinkUnitPrice !== undefined) {
    if (drinkUnitPrice < 0) problems.push('Drink price cannot be negative.');
    else patch.drinkUnitPrice = drinkUnitPrice;
  }

  const cateringPerGuest = num(body.cateringPerGuest);
  if (cateringPerGuest !== undefined) {
    if (cateringPerGuest < 0) problems.push('Catering price cannot be negative.');
    else patch.cateringPerGuest = cateringPerGuest;
  }

  const minPrice = optionalMoney(body.minPrice);
  if (minPrice !== undefined) patch.minPrice = minPrice;

  const barraLibrePrice = optionalMoney(body.barraLibrePrice);
  if (barraLibrePrice !== undefined) patch.barraLibrePrice = barraLibrePrice;

  if (Array.isArray(body.images)) {
    patch.images = (body.images as unknown[])
      .map((i) => String(i).trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  // Add-ons arrive as the full desired list and are stored embedded, so
  // anything missing is simply dropped.
  if (Array.isArray(body.addOns)) {
    patch.addOns = (body.addOns as Record<string, unknown>[])
      .map((a) => ({
        name: String(a?.name ?? '').trim(),
        description: String(a?.description ?? '').trim() || null,
        price: Number(a?.price),
      }))
      .filter((a) => a.name && Number.isFinite(a.price) && a.price >= 0);
  }

  if (problems.length > 0) {
    return NextResponse.json({ error: problems.join(' ') }, { status: 400 });
  }

  try {
    await updateVenueListing(venue!.id, patch);
  } catch (err) {
    console.error('Failed to update venue:', err);
    return NextResponse.json({ error: 'Could not save your changes.' }, { status: 500 });
  }

  const updated = await getPublicVenue(venue!.id);
  return NextResponse.json({ ok: true, venue: updated });
}
