'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ScrollPhoneReel } from '@/components/phone-reel';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURED = [
  { name: 'Showroom Fashion Bar', place: 'Sant Gervasi, Barcelona', img: '/venues/showroom-fashion-bar/3.jpg' },
  { name: 'Catalonia Plaza', place: "Plaça d'Espanya, Barcelona", img: '/venues/catalonia-barcelona-plaza/1.jpg' },
  { name: 'Renaissance Fira', place: "L'Hospitalet de Llobregat", img: '/venues/renaissance-barcelona-fira/1.jpg' },
];

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();

  const actions = [
    { n: '01', label: t('home.cta.browseVenues'), href: '/venues', desc: t('home.opt.venuesDesc') },
    { n: '02', label: t('home.cta.createGift'), href: user ? '/gifts/create' : '/login', desc: t('home.opt.giftDesc') },
    { n: '03', label: t('home.cta.payGift'), href: '/guest-login', desc: t('home.opt.payDesc') },
  ];

  return (
    <>
      {/* ── HERO — editorial, asymmetric ─────────────────────── */}
      <section className="grain relative overflow-hidden">
        <div className="wrap pt-10 pb-4 lg:pt-16">
          {/* masthead meta row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between border-b border-[var(--line)] pb-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]"
          >
            <span>Barcelona · Event planning</span>
            <span className="hidden sm:inline">Venues — Gifts — Payments</span>
            <span>Est. 2026</span>
          </motion.div>

          {/* headline + image */}
          <div className="grid grid-cols-1 items-end gap-10 pt-10 lg:grid-cols-12 lg:gap-8 lg:pt-16">
            <div className="lg:col-span-7">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
                className="font-serif font-semibold text-[var(--ink-1)]"
                style={{ fontSize: 'clamp(3rem, 8.5vw, 7rem)', lineHeight: 0.98, letterSpacing: '-0.03em' }}
              >
                {t('home.title1')}{' '}
                <span className="italic text-gold">{t('home.titleGold')}</span>
                <br />
                {t('home.title2')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-7 max-w-md text-lg leading-relaxed text-[var(--ink-2)]"
              >
                {t('home.subtitle')}
              </motion.p>
            </div>

            {/* tall photo, right column */}
            <motion.figure
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-[var(--bg-3)]">
                <Image
                  src="/venues/showroom-fashion-bar/1.jpg"
                  alt="Showroom Fashion Bar, Barcelona"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,20,30,0.5)] via-transparent to-transparent" />
                <figcaption className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <span className="font-serif text-lg">Showroom Fashion Bar</span>
                  <span className="text-[0.7rem] uppercase tracking-[0.15em] opacity-80">Barcelona</span>
                </figcaption>
              </div>
            </motion.figure>
          </div>

          {/* numbered actions — editorial list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-14 grid grid-cols-1 border-t border-[var(--line)] md:grid-cols-3"
          >
            {actions.map((a, i) => (
              <Link
                key={a.n}
                href={a.href}
                className={`group flex items-start gap-4 py-7 transition-colors hover:bg-[var(--bg-2)] md:px-6 ${
                  i > 0 ? 'border-t border-[var(--line)] md:border-l md:border-t-0' : ''
                }`}
              >
                <span className="font-serif text-sm text-[var(--ink-3)] pt-1">{a.n}</span>
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-serif text-xl font-semibold text-[var(--ink-1)]">{a.label}</span>
                    <svg
                      className="text-[var(--amber)] transition-transform duration-300 group-hover:translate-x-1"
                      width="15" height="15" viewBox="0 0 14 14" fill="none"
                    >
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ink-3)]">{a.desc}</span>
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED SPACES — photo row ──────────────────────── */}
      <section className="wrap section">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="t-label-amber mb-1">Featured spaces</p>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)] sm:text-3xl">
              A few of the rooms
            </h2>
          </div>
          <Link
            href="/venues"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--ink-2)] transition hover:text-[var(--amber)]"
          >
            All venues
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
          {FEATURED.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            >
              <Link href="/venues" className="group block">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-[var(--bg-3)]">
                  <Image
                    src={v.img}
                    alt={v.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 30vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-[var(--line)] pt-3">
                  <span className="font-serif text-lg text-[var(--ink-1)]">{v.name}</span>
                  <span className="shrink-0 text-xs uppercase tracking-[0.12em] text-[var(--ink-3)]">{`0${i + 1}`}</span>
                </div>
                <p className="mt-0.5 text-sm text-[var(--ink-3)]">{v.place}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS — one phone, three scenes ───────────── */}
      <section className="wrap pt-2">
        <div className="border-b border-[var(--line)] pb-4">
          <p className="t-label-amber mb-1">How it works</p>
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)] sm:text-3xl">
            From the room to the last euro
          </h2>
        </div>
      </section>
      <ScrollPhoneReel />
    </>
  );
}
