'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { motion, useInView } from 'framer-motion';
import { PayoutPanel } from '@/components/payout-panel';
import type { Gift, GiftContribution } from '@/types';

type GiftFull = Gift & {
  totalPrice: number;
  code: string;
  status: string;
  participantCount?: number;
  eventDate?: Date | string;
  contributions: GiftContribution[];
};

function GiftCard({ gift, origin, index }: { gift: GiftFull; origin: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const contributed = gift.contributions.reduce((s, c) => s + (c.isPaid ? c.amount : 0), 0);
  const progress = Math.min((contributed / gift.totalPrice) * 100, 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (index % 2) * 0.08 }}
      className="card card-p flex flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--ink-1)] tracking-tight">{gift.title}</h3>
          <p className="mt-0.5 text-xs text-[var(--ink-3)]">
            {gift.eventDate ? new Date(gift.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
        <span className="badge badge-amber shrink-0 tracking-widest">{gift.code}</span>
      </div>

      {gift.description && <p className="text-sm leading-5.5 text-[var(--ink-2)] line-clamp-2">{gift.description}</p>}

      {/* Progress */}
      <div className="space-y-2.5">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--ink-2)]">
            <span className="font-semibold text-[var(--ink-1)]">${contributed.toFixed(0)}</span>
            <span className="text-[var(--ink-3)]"> / ${gift.totalPrice.toFixed(0)}</span>
          </span>
          <span className="font-semibold text-[var(--amber)]">{Math.round(progress)}%</span>
        </div>
        <div className="progress">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={inView ? { width: `${progress}%` } : {}}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="tile">
          <p className="t-label mb-1.5">Guests</p>
          <p className="text-lg font-semibold text-[var(--ink-1)]">{gift.participantCount ?? '—'}</p>
        </div>
        <div className="tile-amber">
          <p className="t-label-amber mb-1.5">Per person</p>
          <p className="text-lg font-semibold text-[var(--ink-1)]">
            ${gift.participantCount ? (gift.totalPrice / gift.participantCount).toFixed(0) : '—'}
          </p>
        </div>
      </div>

      {/* Share link */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-3.5">
        <p className="t-label mb-1.5">Guest payment link</p>
        <p className="t-mono text-[var(--ink-2)] break-all leading-5">{origin}/gift/{gift.code}</p>
      </div>

      <Link href={`/gift/${gift.code}`} className="mt-auto">
        <button className="btn btn-ghost w-full">Open share view</button>
      </Link>
    </motion.div>
  );
}

export default function GiftsPage() {
  const { user } = useAuth();
  const [queryState] = useState(() => {
    if (typeof window === 'undefined') return { code: null as string | null, checkout: null as string | null };
    const sp = new URLSearchParams(window.location.search);
    return { code: sp.get('code'), checkout: sp.get('checkout') };
  });
  const code   = queryState.code;
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  const [gifts,       setGifts]       = useState<GiftFull[]>([]);
  const [selected,    setSelected]    = useState<GiftFull | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [guestName,   setGuestName]   = useState('');
  const [amount,      setAmount]      = useState('');
  const [guestErr,    setGuestErr]    = useState(queryState.checkout === 'cancel' ? 'Payment was cancelled.' : '');
  const [guestOk,     setGuestOk]     = useState(queryState.checkout === 'success' ? 'Payment complete. Your contribution will appear once confirmed.' : '');
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (code) {
          const r = await axios.get(`/api/gifts?code=${code}`);
          setSelected(r.data);
        } else {
          const r = await axios.get('/api/gifts');
          setGifts(r.data);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [code]);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setGuestErr(''); setGuestOk('');
    try {
      const r = await axios.post('/api/payments/create-checkout-session', { code, guestName, amount: Number(amount) });
      if (r.data.checkoutUrl) { window.location.href = r.data.checkoutUrl; return; }
      setGuestErr('Unable to open checkout.');
    } catch (err: unknown) {
      setGuestErr(axios.isAxiosError(err) ? (err.response?.data?.error || 'Failed to contribute.') : 'Failed to contribute.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="wrap page space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 card animate-pulse bg-[var(--bg-2)]" />)}
    </div>
  );

  /* ── Single gift ─────────────────────────── */
  if (selected) {
    const paid = selected.contributions.filter((c) => c.isPaid);
    const collected = paid.reduce((s, c) => s + c.amount, 0);
    const progress = Math.min((collected / selected.totalPrice) * 100, 100);
    const perPerson = selected.participantCount ? selected.totalPrice / selected.participantCount : selected.totalPrice;
    const isOrganizer = user?.uid === selected.createdBy;

    return (
      <div className="wrap page space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-2">
          <p className="t-label-amber">Shared gift</p>
          <h1 className="t-title">{selected.title}</h1>
          {selected.description && <p className="t-body max-w-xl">{selected.description}</p>}
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.88fr]">
          {/* Progress panel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="card card-p space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="t-label mb-1">Collection progress</p>
                <p className="text-2xl font-semibold tabular-nums text-[var(--ink-1)]">
                  ${collected.toFixed(0)} <span className="text-base font-normal text-[var(--ink-3)]">of ${selected.totalPrice.toFixed(0)}</span>
                </p>
              </div>
              <span className="badge badge-amber">{Math.round(progress)}%</span>
            </div>
            <div className="progress">
              <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="tile text-center">
                <p className="t-label mb-1.5">Guests</p>
                <p className="text-xl font-semibold text-[var(--ink-1)]">{selected.participantCount ?? '—'}</p>
              </div>
              <div className="tile text-center">
                <p className="t-label mb-1.5">Date</p>
                <p className="text-sm font-semibold text-[var(--ink-1)]">
                  {selected.eventDate ? new Date(selected.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                </p>
              </div>
              <div className="tile-amber text-center">
                <p className="t-label-amber mb-1.5">Per share</p>
                <p className="text-xl font-semibold text-[var(--ink-1)]">${perPerson.toFixed(0)}</p>
              </div>
            </div>

            {/* Contributors */}
            <div>
              <p className="text-sm font-semibold text-[var(--ink-1)] mb-3">Contributors</p>
              {paid.length === 0 ? (
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4 text-sm text-[var(--ink-3)]">
                  No contributions yet. Share the link with your guests.
                </div>
              ) : (
                <div className="space-y-2">
                  {paid.map((c) => (
                    <div key={c.id} className="flex justify-between rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--ink-1)]">{c.user?.name || 'Guest'}</p>
                        <p className="text-xs text-[var(--ink-3)]">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm font-semibold text-[var(--amber)]">${c.amount.toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Contribute / share */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }} className="card card-p space-y-5">
            <div>
              <p className="t-label mb-1">{isOrganizer ? 'Share' : 'Contribute'}</p>
              <h2 className="text-xl font-semibold text-[var(--ink-1)]">{isOrganizer ? 'Send the link' : 'Pay your share'}</h2>
              <p className="mt-1.5 text-sm text-[var(--ink-2)]">
                {isOrganizer ? 'Copy this link and send it to your guests.' : 'Enter your name and amount, then pay securely via Stripe.'}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--amber-br)] bg-[var(--amber-lo)] p-4">
              <p className="t-label-amber mb-1.5">Guest payment link</p>
              <p className="t-mono text-[var(--ink-2)] break-all leading-5">{origin}/gift/{selected.code}</p>
            </div>

            {!isOrganizer && (
              <form className="space-y-3" onSubmit={handleContribute}>
                {guestErr && <p className="alert-err">{guestErr}</p>}
                {guestOk  && <p className="alert-ok">{guestOk}</p>}
                <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" className="inp" required />
                <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Suggested: $${perPerson.toFixed(0)}`} className="inp" required />
                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>{submitting ? 'Opening Stripe…' : 'Pay with Stripe'}</button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Gift list ───────────────────────────── */
  return (
    <div className="wrap page space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="t-label-amber mb-2">Gift dashboard</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="t-title">
            Your gift collections
          </motion.h1>
        </div>
        <Link href="/gifts/create">
          <button className="btn btn-primary shrink-0">Create gift</button>
        </Link>
      </div>

      <PayoutPanel />

      <div className="rule" />

      {gifts.length === 0 ? (
        <div className="card card-p text-center py-20 space-y-4">
          <p className="t-body">No gifts yet. Create your first shared collection.</p>
          <Link href="/gifts/create"><button className="btn btn-primary">Create first gift</button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {gifts.map((g, i) => <GiftCard key={g.id} gift={g} origin={origin} index={i} />)}
        </div>
      )}
    </div>
  );
}
