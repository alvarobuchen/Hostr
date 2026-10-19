'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CreateGiftPage() {
  const router = useRouter();
  const [title,            setTitle]            = useState('');
  const [description,      setDescription]      = useState('');
  const [totalAmount,      setTotalAmount]      = useState('');
  const [participantCount, setParticipantCount] = useState('');
  const [eventDate,        setEventDate]        = useState('');
  const [clubName,         setClubName]         = useState('');
  const [clubTicketPrice,  setClubTicketPrice]  = useState('35');
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');

  const suggestedShare = useMemo(() => {
    const a = Number(totalAmount), p = Number(participantCount);
    return a && p ? a / p : 0;
  }, [totalAmount, participantCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await axios.post('/api/gifts', {
        title, description,
        totalPrice: Number(totalAmount),
        participantCount: Number(participantCount),
        eventDate,
        clubName: clubName || undefined,
        clubTicketPrice: clubName ? Number(clubTicketPrice) : undefined,
        clubTotalTickets: participantCount ? Number(participantCount) : undefined,
      });
      router.push(`/gifts?code=${r.data.code}`);
    } catch (err: unknown) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error || 'Failed to create gift.') : 'Failed to create gift.');
    } finally { setLoading(false); }
  };

  return (
    <div className="wrap page">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.78fr] max-w-5xl mx-auto">

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card card-p space-y-7"
        >
          <div>
            <Link href="/gifts" className="inline-flex items-center gap-1.5 text-sm text-[var(--ink-2)] hover:text-[var(--ink-1)] transition-colors mb-5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              All gifts
            </Link>
            <p className="t-label-amber mb-2">New collection</p>
            <h1 className="text-2xl font-semibold text-[var(--ink-1)]">Create a gift collection</h1>
            <p className="mt-2 text-sm text-[var(--ink-2)]">Set the goal, count, and date. You&apos;ll get a shareable link and code instantly.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <p className="alert-err">{error}</p>}

            <div>
              <label className="field-label">Gift title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Birthday present for Ana" className="inp" required />
            </div>

            <div>
              <label className="field-label">Description <span className="text-[var(--ink-4)]">(optional)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what guests are contributing toward" className="inp min-h-24 resize-none" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Total amount ($)</label>
                <input type="number" min="1" step="1" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="e.g. 300" className="inp" required />
              </div>
              <div>
                <label className="field-label">Number of guests</label>
                <input type="number" min="1" step="1" value={participantCount} onChange={(e) => setParticipantCount(e.target.value)} placeholder="e.g. 12" className="inp" required />
              </div>
            </div>

            <div>
              <label className="field-label">Event date</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="inp" required />
            </div>

            {/* Afterparty */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4 space-y-3">
              <p className="text-sm font-semibold text-[var(--ink-1)]">Afterparty <span className="text-xs font-normal text-[var(--ink-3)]">optional</span></p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Club</label>
                  <select value={clubName} onChange={(e) => setClubName(e.target.value)} className="inp">
                    <option value="">None</option>
                    <option value="Shoko">Shoko</option>
                    <option value="Teatro Kapital">Teatro Kapital</option>
                    <option value="Panda Club">Panda Club</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Ticket price ($)</label>
                  <input type="number" min="1" step="1" value={clubTicketPrice} onChange={(e) => setClubTicketPrice(e.target.value)} placeholder="35" className="inp disabled:opacity-35" disabled={!clubName} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Creating…' : 'Create gift collection'}
            </button>
          </form>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="card card-p space-y-5">
            <p className="t-label">Preview</p>
            <div>
              <h2 className="text-xl font-semibold text-[var(--ink-1)]">{title || 'Your gift collection'}</h2>
              <p className="mt-2 text-sm text-[var(--ink-2)] leading-5.5">
                {description || 'Invite guests to split the total. Everyone gets a suggested amount and a direct Stripe payment link.'}
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Total target', value: `$${Number(totalAmount || 0).toFixed(0)}`, amber: false },
                { label: 'Suggested per guest', value: `$${suggestedShare.toFixed(0)}`, amber: true },
                { label: 'Event date', value: eventDate ? new Date(eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Choose a date', amber: false },
              ].map((row) => (
                <div key={row.label} className={row.amber ? 'tile-amber' : 'tile'}>
                  <p className={row.amber ? 't-label-amber mb-1' : 't-label mb-1'}>{row.label}</p>
                  <motion.p
                    key={row.value}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-semibold text-[var(--ink-1)]"
                  >
                    {row.value}
                  </motion.p>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-p space-y-3">
            <p className="text-sm font-semibold text-[var(--ink-1)]">What happens next</p>
            {[
              'You get a unique code and a shareable guest link.',
              'Dashboard tracks contributions and progress live.',
              'Guests pay via Stripe — no account required.',
            ].map((step, i) => (
              <div key={i} className="flex gap-3 text-sm text-[var(--ink-2)]">
                <span className="font-semibold text-[var(--amber)] shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
