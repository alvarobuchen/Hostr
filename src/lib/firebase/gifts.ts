// Firestore data access for gifts (server / Admin SDK).
// `gifts/{id}` holds the gift (club option embedded); contributions live in the
// `gifts/{id}/contributions` subcollection.
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './admin';

const col = () => adminDb.collection('gifts');

export type Club = {
  clubName: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  date: string | null;
} | null;

type Data = FirebaseFirestore.DocumentData;

function toIso(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  const t = v as { toDate?: () => Date };
  return t.toDate ? t.toDate().toISOString() : null;
}

async function readContributions(giftId: string) {
  const snap = await col().doc(giftId).collection('contributions').get();
  return snap.docs
    .map((d) => {
      const c = d.data();
      return {
        id: d.id,
        amount: Number(c.amount) || 0,
        isPaid: !!c.isPaid,
        addClubTicket: !!c.addClubTicket,
        createdAt: toIso(c.createdAt) ?? new Date(0).toISOString(),
        user: { name: (c.name as string) || 'Guest' },
      };
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function shape(id: string, data: Data, contributions: Awaited<ReturnType<typeof readContributions>>) {
  return {
    id,
    title: data.title,
    description: data.description ?? null,
    totalPrice: Number(data.totalPrice) || 0,
    currency: data.currency || 'USD',
    targetAmount: Number(data.targetAmount ?? data.totalPrice) || 0,
    participantCount: data.participantCount ?? null,
    eventDate: toIso(data.eventDate),
    code: data.code,
    createdBy: data.createdBy,
    status: data.status ?? 'open',
    club: (data.club as Club) ?? null,
    creator: { id: data.createdBy, name: data.creatorName ?? null },
    contributions,
  };
}

export async function createGift(input: {
  title: string;
  description?: string | null;
  totalPrice: number;
  currency?: string;
  participantCount?: number | null;
  eventDate?: string | null;
  code: string;
  createdBy: string;
  creatorName?: string | null;
  club?: Club;
}) {
  const ref = col().doc();
  await ref.set({
    title: input.title,
    description: input.description ?? null,
    totalPrice: input.totalPrice,
    currency: input.currency || 'USD',
    targetAmount: input.totalPrice,
    participantCount: input.participantCount ?? null,
    eventDate: input.eventDate ?? null,
    code: input.code.toUpperCase(),
    createdBy: input.createdBy,
    creatorName: input.creatorName ?? null,
    status: 'open',
    club: input.club ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return getGiftById(ref.id);
}

export async function getGiftById(id: string) {
  const doc = await col().doc(id).get();
  if (!doc.exists) return null;
  return shape(doc.id, doc.data()!, await readContributions(doc.id));
}

async function docByCode(code: string) {
  const snap = await col().where('code', '==', code.toUpperCase()).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

export async function getGiftByCode(code: string) {
  const doc = await docByCode(code);
  if (!doc) return null;
  return shape(doc.id, doc.data(), await readContributions(doc.id));
}

/** Lightweight gift lookup for checkout (no contributions). */
export async function getGiftMetaByCode(code: string) {
  const doc = await docByCode(code);
  if (!doc) return null;
  const d = doc.data();
  return {
    id: doc.id,
    title: d.title,
    code: d.code,
    currency: d.currency || 'USD',
    createdBy: d.createdBy,
    status: (d.status as string) ?? 'open',
    club: (d.club as Club) ?? null,
  };
}

export async function listGiftsByCreator(uid: string) {
  const snap = await col().where('createdBy', '==', uid).get();
  const docs = snap.docs.sort(
    (a, b) => (b.get('createdAt')?.toMillis?.() ?? 0) - (a.get('createdAt')?.toMillis?.() ?? 0),
  );
  return Promise.all(docs.map(async (d) => shape(d.id, d.data(), await readContributions(d.id))));
}

export async function addContribution(
  giftId: string,
  c: { name: string; amount: number; isPaid?: boolean; paymentId?: string | null; addClubTicket?: boolean; ticketType?: string | null },
) {
  const ref = await col().doc(giftId).collection('contributions').add({
    name: c.name,
    amount: c.amount,
    isPaid: c.isPaid ?? false,
    paymentId: c.paymentId ?? null,
    addClubTicket: !!c.addClubTicket,
    ticketType: c.ticketType ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
