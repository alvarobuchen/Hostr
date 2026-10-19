'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { VenueGlyph } from '@/components/motifs';

interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  image?: string;
}

function VenueCard({ venue, index }: { venue: Venue; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.07 }}
    >
      <Link href={`/venues/${venue.id}`} className="group block card card-lift overflow-hidden h-full">
        {/* Real photography when available, else generative branded header */}
        <div className="relative aspect-[3/2] overflow-hidden bg-[var(--bg-3)]">
          {venue.image?.startsWith('/venues/') ? (
            <Image
              src={venue.image}
              alt={venue.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <VenueGlyph initial={venue.name.charAt(0)} />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,20,30,0.55)] to-transparent" />
          {/* Price pill */}
          <div className="absolute bottom-3 right-3">
            <span className="badge badge-amber" style={{ backdropFilter: 'blur(8px)', background: 'rgba(14,20,30,0.72)' }}>
              ${venue.pricePerHour}/hr
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--ink-1)] tracking-tight">{venue.name}</h3>
            <p className="mt-0.5 text-sm text-[var(--ink-3)]">{venue.location}</p>
          </div>
          <p className="text-sm leading-5.5 text-[var(--ink-2)] line-clamp-2">{venue.description}</p>
          <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]">
            <span className="text-sm text-[var(--ink-2)]">Up to <span className="font-semibold text-[var(--ink-1)]">{venue.capacity}</span> guests</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--amber)] transition-all group-hover:gap-2.5">
              Estimate cost
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/venues')
      .then((r) => setVenues(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="wrap page">

      {/* Header */}
      <div className="max-w-3xl mb-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="t-label-amber mb-3"
        >
          Venues
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="t-title"
        >
          Spaces that feel celebration-ready
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mt-4 t-body max-w-xl"
        >
          Compare hourly pricing and capacity, then open any venue to run a live party cost estimator — guests, drinks, catering, and add-ons included.
        </motion.p>
      </div>

      {/* Count line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-4 mb-8"
      >
        <span className="text-sm text-[var(--ink-2)]">
          <span className="font-semibold text-[var(--ink-1)]">{venues.length}</span> {venues.length === 1 ? 'space' : 'spaces'} available
        </span>
        <div className="flex-1 rule" />
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-80 animate-pulse bg-[var(--bg-2)]" />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="card card-p text-center py-20">
          <p className="t-body">No venues available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
