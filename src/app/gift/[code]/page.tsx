'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Gift, GiftContribution } from '@/types';

type GiftFull = Gift & { contributions: GiftContribution[] };

export default function GiftPayPage() {
  const { code } = useParams<{ code: string }>();
  const [queryState] = useState(() => {
    if (typeof window === 'undefined') return { checkout: null as string | null, sessionId: null as string | null };
    const sp = new URLSearchParams(window.location.search);
    return { checkout: sp.get('checkout'), sessionId: sp.get('session_id') };
  });
  const [gift,       setGift]       = useState<GiftFull | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [confirming, setConfirming] = useState(queryState.checkout === 'success');
  const [guestName,  setGuestName]  = useState('');
  const [amount,     setAmount]     = useState('');
  const [clubTicket, setClubTicket] = useState(false);
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  const notice = queryState.checkout === 'success'
    ? (confirming ? 'Confirming your payment…' : 'Payment complete — thank you for contributing!')
    : queryState.checkout === 'cancel'
    ? 'Payment was cancelled. You can try again anytime.'
    : '';

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // On a successful return from Stripe, confirm the session so the
      // contribution is recorded even if the webhook didn't reach us.
      if (queryState.checkout === 'success' && queryState.sessionId) {
        try { await axios.post('/api/payments/confirm', { sessionId: queryState.sessionId }); }
        catch (e) { console.error(e); }
      }
      try {
        const r = await axios.get(`/api/gifts?code=${code}`);
        if (!cancelled) setGift(r.data);
      } catch (e) { console.error(e); }
      finally { if (!cancelled) { setLoading(false); setConfirming(false); } }
    };
    run();
    return () => { cancelled = true; };
  }, [code, queryState.checkout, queryState.sessionId]);

  const stats = useMemo(() => {
    if (!gift) return { collected: 0, progress: 0, suggested: 0 };
    const collected = gift.contributions.reduce((s, c) => s + (c.isPaid ? c.amount : 0), 0);
    const progress  = Math.min((collected / gift.totalPrice) * 100, 100);
    const suggested = gift.participantCount ? gift.totalPrice / gift.participantCount : gift.totalPrice;
    return { collected, progress, suggested };
  }, [gift]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gift) return;
    setSubmitting(true); setError('');
    try {
      const r = await axios.post('/api/payments/create-checkout-session', {
        code: gift.code, guestName, amount: Number(amount), addClubTicket: clubTicket,
      });
      if (r.data.checkoutUrl) { window.location.href = r.data.checkoutUrl; return; }
    } catch (err: unknown) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error || 'Unable to open checkout.') : 'Unable to open checkout.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="wrap page">
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-48 rounded bg-[var(--bg-2)]" />
        <div className="h-80 rounded-2xl bg-[var(--bg-2)]" />
      </div>
    </div>
  );

  if (!gift) return (
    <div className="wrap page flex items-center justify-center">
      <p className="text-sm text-[var(--ink-3)]">Gift not found.</p>
    </div>
  );

  const paidGuests = gift.contributions.filter((c) => c.isPaid);

  return (
    <div className="wrap page">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="t-label-amber mb-2">Guest payment</p>
          <h1 className="t-title">{gift.title}</h1>
          {gift.description && <p className="mt-2 t-body max-w-xl">{gift.description}</p>}
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">

          {/* Left — progress + contributors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="card card-p space-y-6"
          >
            {/* Progress block */}
            <div className="rounded-xl border border-[var(--amber-br)] bg-[var(--amber-lo)] p-5 space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ink-2)]">Collected</span>
                <span className="font-semibold text-[var(--amber)]">{Math.round(stats.progress)}%</span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-[var(--ink-1)]">
                ${stats.collected.toFixed(0)}
                <span className="text-base font-normal text-[var(--ink-3)]"> / ${gift.totalPrice.toFixed(0)}</span>
              </p>
              <div className="progress">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {/* Who paid */}
            <div>
              <p className="text-sm font-semibold text-[var(--ink-1)] mb-3">Already paid</p>
              {paidGuests.length === 0 ? (
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4 text-sm text-[var(--ink-3)]">Be the first to contribute.</div>
              ) : (
                <div className="space-y-2">
                  {paidGuests.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3">
                      <p className="text-sm font-medium text-[var(--ink-1)]">{c.user?.name || 'Guest'}</p>
                      <p className="text-sm font-semibold text-[var(--amber)]">${c.amount.toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right — payment form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="card card-p space-y-5"
          >
            <div>
              <p className="t-label mb-1">Pay your share</p>
              <h2 className="text-xl font-semibold text-[var(--ink-1)]">Complete contribution</h2>
              <p className="mt-1.5 text-sm text-[var(--ink-2)]">
                Suggested amount: <span className="font-semibold text-[var(--ink-1)]">${stats.suggested.toFixed(0)}</span>
              </p>
            </div>

            {notice && (
              <div className={notice.startsWith('Payment complete') ? 'alert-ok' : 'alert-info'}>
                {notice}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleCheckout}>
              {error && <p className="alert-err">{error}</p>}

              <div>
                <label className="field-label">Your name</label>
                <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. María López" className="inp" required />
              </div>
              <div>
                <label className="field-label">Amount ($)</label>
                <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Suggested: $${stats.suggested.toFixed(0)}`} className="inp" required />
              </div>

              {gift.club?.clubName === 'Shoko' && (
                <label className="flex items-center justify-between rounded-xl border border-[var(--amber-br)] bg-[var(--amber-lo)] px-4 py-3 cursor-pointer">
                  <span className="text-sm text-[var(--ink-1)]">Add Shoko afterparty ticket?</span>
                  <input type="checkbox" checked={clubTicket} onChange={(e) => setClubTicket(e.target.checked)} className="h-4 w-4 rounded accent-[var(--amber)]" />
                </label>
              )}

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting}>
                {submitting ? 'Opening Stripe…' : 'Pay now with Stripe'}
              </button>
            </form>

            <p className="text-xs text-center text-[var(--ink-3)]">
              Payments are processed securely by Stripe. No account needed.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
