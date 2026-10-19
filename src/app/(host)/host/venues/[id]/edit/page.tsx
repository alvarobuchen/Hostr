import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getHostSession } from '@/lib/host';
import { getVenueDoc, getPublicVenue } from '@/lib/firebase/venues';
import { EditListingForm } from './edit-listing-form';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;

  const host = await getHostSession();
  if (!host) redirect(`/login?callbackUrl=/host/venues/${id}/edit`);

  const doc = await getVenueDoc(id);
  // Same 404 for "missing" and "not yours" so the page never confirms a venue
  // exists to someone who doesn't host it.
  if (!doc || doc.data.ownerId !== host.userId) notFound();

  const venue = await getPublicVenue(id);
  if (!venue) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink-1)]">Edit listing</h2>
          <p className="mt-1 text-sm text-[var(--ink-2)]">
            Everything here is what guests see on your marketplace page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/venues/${venue.id}`} className="btn btn-ghost btn-sm">View listing</Link>
          <Link href="/host" className="btn btn-ghost btn-sm">Back to overview</Link>
        </div>
      </div>

      <EditListingForm
        venue={{
          id: venue.id,
          name: venue.name,
          description: venue.description,
          location: venue.location,
          capacity: venue.capacity,
          pricePerHour: venue.pricePerHour,
          minPrice: venue.minPrice,
          maxHours: venue.maxHours,
          maxDrinks: venue.maxDrinks,
          drinkUnitPrice: venue.drinkUnitPrice,
          barraLibrePrice: venue.barraLibrePrice,
          cateringPerGuest: venue.cateringPerGuest,
          images: venue.images,
          addOns: venue.addOns.map((a) => ({
            name: a.name,
            description: a.description ?? '',
            price: a.price,
          })),
        }}
      />
    </div>
  );
}
