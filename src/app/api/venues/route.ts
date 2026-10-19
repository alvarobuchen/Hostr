import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { getCurrentUser } from '@/lib/firebase/session';
import { listPublicVenues } from '@/lib/firebase/venues';

// Get all venues (seeds the curated demo venues on first run).
export async function GET() {
  try {
    const venues = await listPublicVenues();
    return NextResponse.json(venues);
  } catch (error) {
    console.error('Failed to fetch venues:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}

// Create a new venue (authenticated).
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, location, capacity, pricePerHour, image, addOns } = body;

    const ref = await adminDb.collection('venues').add({
      name,
      description,
      location,
      capacity,
      pricePerHour,
      image: image ?? null,
      addOns: Array.isArray(addOns) ? addOns : [],
      createdBy: authUser.uid,
      ownerId: null,
      claimCode: null,
      order: Number.MAX_SAFE_INTEGER,
      createdAt: FieldValue.serverTimestamp(),
    });

    const doc = await ref.get();
    return NextResponse.json({ id: ref.id, ...doc.data() }, { status: 201 });
  } catch (error) {
    console.error('Failed to create venue:', error);
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
  }
}
