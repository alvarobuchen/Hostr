'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { VenueGlyph } from '@/components/motifs';
import { demoVenues } from '@/lib/demo-data';
import { BARRA_LIBRE, computeEstimate, type DrinksChoice } from '@/lib/booking';
import type { Venue } from '@/types';

type VenueDetails = Venue & {
  addOns: Array<{ id: string; name: string; description?: string; price: number }>;
};

const attendeeOpts = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function buildMonth(cursor: Date): (Date | null)[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Mon-first
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(new Date(year, month, d));
  return cells;
}

export default function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [venue,          setVenue]          = useState<VenueDetails | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [attendees,      setAttendees]      = useState(20);
  const [rawDrinks,      setDrinksPerPerson]= useState<DrinksChoice>(2);
  const [rawHours,       setHours]          = useState(4);
  const [catering,       setCatering]       = useState(true);
  const [activeImg,      setActiveImg]      = useState(0);
  const [selectedDate,   setSelectedDate]   = useState<string | null>(null);
  const [unavailable,    setUnavailable]    = useState<Set<string>>(new Set());
  const [monthCursor,    setMonthCursor]    = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [booking,        setBooking]        = useState(false);
  const [bookingError,   setBookingError]   = useState<string | null>(null);
  const [confirmed,      setConfirmed]      = useState(false);

  useEffect(() => {
    axios.get(`/api/venues/${id}`)
      .then((r) => setVenue(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    axios.get(`/api/venues/${id}/availability`)
      .then((r) => {
        setUnavailable(new Set<string>(r.data.unavailable));
        // Show a confirmation when returning from a successful Stripe deposit.
        if (new URLSearchParams(window.location.search).get('booking') === 'success') {
          setConfirmed(true);
        }
      })
      .catch(console.error);
  }, [id]);

  const gallery = useMemo(() => {
    if (!venue) return [] as string[];
    // What the host saved wins; the demo set only fills in for seeded venues
    // that predate the listing editor.
    if (venue.images?.length) return venue.images;
    const demo = demoVenues.find((d) => d.name === venue.name);
    if (demo?.images?.length) return demo.images;
    if (venue.image?.startsWith('/venues/')) return [venue.image];
    return [];
  }, [venue]);

  // Drink tiers run 1..maxDrinks, then open bar when the host prices one.
  const drinksOpts = useMemo(() => {
    const cap = venue?.maxDrinks ?? 6;
    return Array.from({ length: Math.max(0, Math.min(cap, 20)) }, (_, i) => i + 1);
  }, [venue]);

  const offersBarraLibre =
    venue?.barraLibrePrice !== null && venue?.barraLibrePrice !== undefined;

  const hourOpts = useMemo(() => {
    const max = venue?.maxHours ?? 9;
    return Array.from({ length: Math.max(1, max - 1) }, (_, i) => i + 2);
  }, [venue]);

  // A host can set limits below our defaults, so clamp the raw selection at
  // render time rather than storing a value the dropdown no longer offers.
  const hours = Math.min(Math.max(rawHours, 2), Math.max(venue?.maxHours ?? 9, 2));
  const drinksPerPerson: DrinksChoice =
    rawDrinks === BARRA_LIBRE
      ? (offersBarraLibre ? BARRA_LIBRE : 1)
      : Math.min(rawDrinks, Math.max(venue?.maxDrinks ?? 6, 1));

  const est = useMemo(() => {
    if (!venue) {
      return { base: 0, drinks: 0, catering: 0, extras: 0, subtotal: 0, minimumTopUp: 0, total: 0, deposit: 0 };
    }
    return computeEstimate({
      pricePerHour: venue.pricePerHour,
      hours,
      attendees,
      drinksPerPerson,
      catering,
      addOnsTotal: venue.addOns.reduce((s, a) => s + a.price, 0),
      drinkUnitPrice: venue.drinkUnitPrice,
      barraLibrePrice: venue.barraLibrePrice,
      cateringPerGuest: venue.cateringPerGuest,
      minPrice: venue.minPrice,
    });
  }, [attendees, drinksPerPerson, hours, catering, venue]);

  if (loading) return (
    <div className="wrap page">
      <div className="animate-pulse space-y-4">
        <div className="h-72 rounded-2xl bg-[var(--bg-2)]" />
        <div className="h-6 w-1/3 rounded bg-[var(--bg-2)]" />
        <div className="h-4 w-2/3 rounded bg-[var(--bg-2)]" />
      </div>
    </div>
  );

  if (!venue) return (
    <div className="wrap page flex flex-col items-center text-center gap-5">
      <h1 className="t-title">Venue not found</h1>
      <p className="t-body">Pick one of the curated spaces to estimate your party budget.</p>
      <Link href="/venues"><button className="btn btn-primary">Back to venues</button></Link>
    </div>
  );

  const mapQuery = encodeURIComponent(
    venue.location.includes(',') ? `${venue.location}, Spain` : `${venue.location}, Madrid, Spain`
  );
  const activeSrc = gallery[activeImg] ?? gallery[0];

  const monthDays = buildMonth(monthCursor);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const monthLabel = monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  async function onReserve() {
    if (!user) { router.push(`/login?callbackUrl=/venues/${id}`); return; }
    if (!selectedDate) { setBookingError('Pick a date for your event first.'); return; }
    setBooking(true);
    setBookingError(null);
    try {
      const r = await axios.post('/api/bookings', {
        venueId: id, date: selectedDate, hours, attendees, drinksPerPerson, catering,
      });
      if (r.data.checkoutUrl) { window.location.href = r.data.checkoutUrl; return; }
      if (r.data.booked) {
        setConfirmed(true);
        setUnavailable((prev) => new Set(prev).add(selectedDate));
        setSelectedDate(null);
      }
    } catch (err) {
      setBookingError(
        (axios.isAxiosError(err) && err.response?.data?.error) ||
          'Could not complete the booking. Please try again.',
      );
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="wrap page space-y-6">

      {/* ── Venue hero ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="card overflow-hidden"
      >
        <div className="grid lg:grid-cols-[1.4fr_0.6fr]">
          {/* Real photography when available, else generative branded header */}
          <div
            className={`relative bg-[var(--bg-3)] overflow-hidden ${
              gallery.length > 0 ? 'self-start aspect-[3/2]' : 'min-h-72'
            }`}
          >
            {gallery.length > 0 ? (
              <>
                <Image
                  key={activeSrc}
                  src={activeSrc}
                  alt={venue.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  className="object-contain"
                />
                {/* Thumbnail strip */}
                {gallery.length > 1 && (
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto pb-0.5">
                    {gallery.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        aria-label={`Show photo ${i + 1}`}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          i === activeImg
                            ? 'border-[var(--amber)]'
                            : 'border-white/40 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <VenueGlyph initial={venue.name.charAt(0)} />
            )}
          </div>

          {/* Info */}
          <div className="card-p flex flex-col gap-5">
            <Link href="/venues" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-2)] hover:text-[var(--ink-1)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              All venues
            </Link>
            <div>
              <p className="t-label mb-1">Curated venue</p>
              <h1 className="text-2xl font-semibold text-[var(--ink-1)] tracking-tight">{venue.name}</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-2)]">{venue.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <div className="tile">
                <p className="t-label mb-1.5">Location</p>
                <p className="text-sm font-semibold text-[var(--ink-1)] truncate">{venue.location}</p>
              </div>
              <div className="tile-amber">
                <p className="t-label-amber mb-1.5">Base rate</p>
                <p className="text-sm font-semibold text-[var(--ink-1)]">${venue.pricePerHour}/hr</p>
              </div>
              <div className="tile col-span-2">
                <p className="t-label mb-1.5">Max capacity</p>
                <p className="text-lg font-semibold text-[var(--ink-1)]">{venue.capacity} guests</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Location map ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="card overflow-hidden"
      >
        <div className="card-p pb-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="t-label mb-1">Location</p>
            <h2 className="text-xl font-semibold text-[var(--ink-1)]">{venue.location}</h2>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 7.5a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5z" stroke="currentColor" strokeWidth="1.4"/><path d="M7 12.5s4.5-3.2 4.5-6.75A4.5 4.5 0 007 1.25a4.5 4.5 0 00-4.5 4.5C2.5 9.3 7 12.5 7 12.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            Open in Google Maps
          </a>
        </div>
        <iframe
          title={`Map showing ${venue.name} in ${venue.location}`}
          src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
          className="block h-80 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </motion.div>

      {/* ── Estimator + Add-ons ─────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">

        {/* Estimator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card card-p space-y-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="t-label mb-1">Party estimator</p>
              <h2 className="text-xl font-semibold text-[var(--ink-1)]">Customize your event</h2>
            </div>
            <span className="badge badge-amber shrink-0">Live estimate</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Guests</label>
              <select value={attendees} onChange={(e) => setAttendees(Number(e.target.value))} className="inp">
                {attendeeOpts.map((o) => <option key={o} value={o}>{o} guests</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Drinks per person</label>
              <select
                value={drinksPerPerson}
                onChange={(e) =>
                  setDrinksPerPerson(
                    e.target.value === BARRA_LIBRE ? BARRA_LIBRE : Number(e.target.value),
                  )
                }
                className="inp"
              >
                {drinksOpts.map((o) => (
                  <option key={o} value={o}>{o} {o === 1 ? 'drink' : 'drinks'}</option>
                ))}
                {offersBarraLibre && (
                  <option value={BARRA_LIBRE}>
                    Barra Libre — ${venue.barraLibrePrice}/guest
                  </option>
                )}
              </select>
            </div>
            <div>
              <label className="field-label">Duration</label>
              <select value={hours} onChange={(e) => setHours(Number(e.target.value))} className="inp">
                {hourOpts.map((o) => <option key={o} value={o}>{o} hours</option>)}
              </select>
            </div>
            <label className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3 cursor-pointer hover:border-[var(--line-2)] transition-colors">
              <div>
                <p className="text-sm font-medium text-[var(--ink-1)]">Catering</p>
                <p className="text-xs text-[var(--ink-3)] mt-0.5">
                  ${venue.cateringPerGuest ?? 24} per guest
                </p>
              </div>
              <input type="checkbox" checked={catering} onChange={(e) => setCatering(e.target.checked)} className="h-4 w-4 rounded accent-[var(--amber)]" />
            </label>
          </div>

          {/* Date picker */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="field-label mb-0">Event date</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  className="btn btn-ghost btn-sm"
                >
                  ‹
                </button>
                <span className="min-w-32 text-center text-xs font-semibold text-[var(--ink-1)]">{monthLabel}</span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  className="btn btn-ghost btn-sm"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-[11px] font-medium text-[var(--ink-3)]">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, i) => {
                if (!date) return <div key={`e${i}`} />;
                const key = ymd(date);
                const past = date < todayMidnight;
                const taken = unavailable.has(key);
                const disabled = past || taken;
                const active = selectedDate === key;
                let cls = 'border-[var(--line)] bg-[var(--bg-1)] text-[var(--ink-1)] hover:border-[var(--line-2)]';
                if (active) cls = 'border-[var(--amber)] bg-[var(--amber)] text-white';
                else if (disabled) cls = 'border-transparent bg-[var(--bg-2)] text-[var(--ink-3)] line-through cursor-not-allowed';
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => { setSelectedDate(key); setBookingError(null); }}
                    title={taken ? 'Unavailable' : undefined}
                    className={`aspect-square rounded-lg border text-sm font-medium transition-colors ${cls}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-5 space-y-3">
            {[
              ['Venue hire', est.base],
              [drinksPerPerson === BARRA_LIBRE ? 'Barra Libre' : 'Drinks', est.drinks],
              ['Catering', est.catering],
              ['Add-on extras', est.extras],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between text-sm">
                <span className="text-[var(--ink-2)]">{label}</span>
                <span className="font-medium text-[var(--ink-1)]">${(val as number).toFixed(0)}</span>
              </div>
            ))}
            {est.minimumTopUp > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--ink-2)]">
                  Minimum spend top-up
                  <span className="ml-1 text-xs text-[var(--ink-3)]">(${venue.minPrice} minimum)</span>
                </span>
                <span className="font-medium text-[var(--ink-1)]">${est.minimumTopUp.toFixed(0)}</span>
              </div>
            )}
            <div className="rule" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--ink-3)]">Estimated total</p>
                <motion.p
                  key={est.total}
                  initial={{ opacity: 0.6, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl font-semibold text-[var(--amber)] tabular-nums"
                >
                  ${est.total.toFixed(0)}
                </motion.p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--ink-3)]">Deposit due now (20%)</p>
                <p className="text-lg font-semibold text-[var(--ink-1)] tabular-nums">${est.deposit.toFixed(0)}</p>
              </div>
            </div>

            {confirmed && (
              <div className="rounded-lg border border-[var(--amber)] bg-[rgba(176,131,46,0.1)] px-4 py-3 text-sm text-[var(--ink-1)]">
                🎉 Your reservation is confirmed. The host can see it in their dashboard.
              </div>
            )}
            {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}

            <button
              className="btn btn-primary w-full"
              disabled={booking}
              onClick={onReserve}
            >
              {!user
                ? 'Sign in to reserve'
                : booking
                  ? 'Processing…'
                  : selectedDate
                    ? `Reserve for ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · $${est.deposit.toFixed(0)} deposit`
                    : 'Pick a date to reserve'}
            </button>
          </div>
        </motion.div>

        {/* Add-ons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="card card-p space-y-5"
        >
          <div>
            <p className="t-label mb-1">Included add-ons</p>
            <h2 className="text-xl font-semibold text-[var(--ink-1)]">What&apos;s available</h2>
          </div>
          <div className="space-y-2.5">
            {venue.addOns.length === 0 ? (
              <p className="text-sm text-[var(--ink-3)]">No add-ons for this venue.</p>
            ) : venue.addOns.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink-1)]">{a.name}</p>
                  {a.description && <p className="mt-1 text-xs leading-5 text-[var(--ink-2)]">{a.description}</p>}
                </div>
                <span className="badge badge-amber shrink-0">${a.price}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
