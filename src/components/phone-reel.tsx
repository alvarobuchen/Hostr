'use client';

import { useEffect, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* ════════════════════════════════════════════════
   CENIT — Scroll-driven phone reel (Remotion)
   One phone, two product screens. Scroll scrubs a single
   Remotion timeline: first VENUES, then a push transition,
   then PAYMENTS. Colours + sizing follow the brand system
   (cream surfaces · navy ink · gold accent).
════════════════════════════════════════════════ */

// Brand literals (kept explicit so the composition reads standalone)
const NAVY = '#16263F';
const GOLD = '#B0832E';
const GOLD_HI = '#D8B061';
const CREAM = '#F5F1E8';
const BG = '#FBFAF7';
const CARD = '#FFFFFF';
const BG2 = '#F4F1EA';
const INK1 = '#16263F';
const INK2 = 'rgba(22,38,63,0.66)';
const INK3 = 'rgba(22,38,63,0.45)';
const LINE = 'rgba(22,38,63,0.12)';

const FPS = 30;
const DURATION = 300;
const H1 = 100; // venues → set the goal
const H2 = 200; // set the goal → guests pay
const FONT_DISPLAY = 'var(--font-fraunces), Georgia, serif';
const FONT_SANS = 'var(--font-inter), Inter, system-ui, sans-serif';

// 3D phone geometry (the composition is a roomy canvas; the device sits centred
// inside it with margin so it can rotate without clipping).
const CANVAS_W = 470;
const CANVAS_H = 770;
const PW = 338;   // device width
const PH = 714;   // device height
const DEPTH = 30; // extrusion depth
const R = 46;     // corner radius

const screen: React.CSSProperties = {
  paddingTop: 60,
  paddingLeft: 24,
  paddingRight: 24,
  paddingBottom: 38,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

/* ── Small glyphs ─────────────────────────────── */
const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
    <path d="M9 2 4 7l5 5" stroke={INK2} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Dots = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill={INK3}>
    <circle cx="3" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="13" cy="8" r="1.4" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke={INK3} strokeWidth="1.6" />
    <path d="M11 11l3.6 3.6" stroke={INK3} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="#fff">
    <path d="M6 .6l1.55 3.2 3.5.5-2.55 2.45.6 3.5L6 8.95 2.85 10.6l.6-3.5L.95 4.3l3.5-.5z" />
  </svg>
);
const RightArrow = ({ stroke = INK2 }: { stroke?: string }) => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M2 7h10M8 3l4 4-4 4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* A simple, deterministic city/garden silhouette painted into a venue card. */
const Decor = ({ seed }: { seed: number }) => {
  const xs = [16, 70, 124, 178, 232, 268];
  const h = (n: number) => 46 + ((seed * 13 + n * 31) % 64);
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 134" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0 }}>
      <circle cx={252} cy={34} r={15} fill={GOLD_HI} fillOpacity={0.22} />
      <g fill={CREAM} fillOpacity={0.1}>
        {xs.map((x, n) => {
          const bh = h(n);
          return <rect key={n} x={x} y={134 - bh} width={36} height={bh} rx={2} />;
        })}
      </g>
      <g fill={CREAM} fillOpacity={0.2}>
        {xs.map((x, n) => {
          const bh = h(n);
          return [0, 1, 2, 3].map((r) =>
            [0, 1].map((c) => {
              const wy = 134 - bh + 9 + r * 15;
              if (wy > 124) return null;
              return <rect key={`${n}-${r}-${c}`} x={x + 7 + c * 15} y={wy} width={7} height={9} rx={1.5} />;
            }),
          );
        })}
      </g>
    </svg>
  );
};

/* Venue feed — the list the reel scrolls through. */
const VENUES = [
  { name: 'The Atrium Loft', meta: 'Downtown · up to 120 guests', price: 120, rating: 4.9, tone: ['#22364F', '#16263F'] },
  { name: 'Garden Pavilion', meta: 'Riverside · up to 80 guests', price: 95, rating: 4.8, tone: ['#3a4a3f', '#1c2c24'] },
  { name: 'Skyline Terrace', meta: 'Uptown · up to 150 guests', price: 165, rating: 5.0, tone: ['#4a3f2a', '#2a2214'] },
  { name: 'The Gallery', meta: 'Arts District · up to 90 guests', price: 110, rating: 4.7, tone: ['#3f3a4a', '#231e2c'] },
  { name: 'Velvet Hall', meta: 'Midtown · up to 200 guests', price: 185, rating: 4.9, tone: ['#4a2e3a', '#2a1820'] },
  { name: 'Rooftop No. 9', meta: 'Harbor · up to 60 guests', price: 140, rating: 5.0, tone: ['#2e4a48', '#162c2a'] },
] as const;

const VENUE_HEADER_H = 178;

function VenueCard({ v, seed }: { v: (typeof VENUES)[number]; seed: number }) {
  return (
    <div style={{ borderRadius: 24, overflow: 'hidden', background: CARD, border: `1px solid ${LINE}`, boxShadow: '0 18px 36px -24px rgba(15,18,24,0.55)' }}>
      <div style={{ position: 'relative', height: 134, background: `linear-gradient(155deg, ${v.tone[0]}, ${v.tone[1]})` }}>
        <Decor seed={seed} />
        <div
          style={{
            position: 'absolute', top: 11, left: 11, display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.24)',
            color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 9px', borderRadius: 999,
          }}
        >
          <StarIcon /> {v.rating.toFixed(1)}
        </div>
        <div style={{ position: 'absolute', bottom: 11, right: 11, background: GOLD, color: '#fff', fontWeight: 700, fontSize: 12.5, padding: '5px 11px', borderRadius: 999 }}>
          ${v.price}/hr
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px 14px' }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 19, color: INK1, letterSpacing: -0.3 }}>{v.name}</div>
          <div style={{ fontSize: 13, color: INK3, marginTop: 2 }}>{v.meta}</div>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: BG2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <RightArrow />
        </div>
      </div>
    </div>
  );
}

function VenueFeedHeader({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        position: 'absolute', insetInline: 0, top: 0, zIndex: 3,
        padding: '46px 18px 14px',
        background: 'linear-gradient(180deg, rgba(251,250,247,0.98) 64%, rgba(251,250,247,0))',
        opacity,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 23, color: INK1, letterSpacing: -0.3 }}>Venues</div>
        <Dots />
      </div>
      <div style={{ marginTop: 11, height: 40, borderRadius: 12, background: CARD, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px' }}>
        <SearchIcon />
        <span style={{ fontSize: 13.5, color: INK3 }}>Search spaces…</span>
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 11 }}>
        {['All', 'Rooftop', 'Garden', 'Loft'].map((c, i) => (
          <span
            key={c}
            style={{
              fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999,
              background: i === 0 ? NAVY : BG2, color: i === 0 ? CREAM : INK2,
              border: `1px solid ${i === 0 ? NAVY : LINE}`,
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function AppBar({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <Chevron />
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: INK3 }}>{title}</span>
      <Dots />
    </div>
  );
}

/* ── Scene A — Venues (a feed the scroll travels through) ── */
function VenueScreen({ frame }: { frame: number }) {
  const intro = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  // As the reel is scrubbed forward, the feed travels upward and more venues arrive.
  const scrollY = interpolate(frame, [8, H1 - 6], [0, 720], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* the scrolling list of venues */}
      <div
        style={{
          position: 'absolute', insetInline: 0, top: 0,
          padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 16,
          transform: `translateY(${VENUE_HEADER_H - scrollY}px)`,
          opacity: intro,
        }}
      >
        {VENUES.map((v, i) => (
          <VenueCard key={v.name} v={v} seed={i + 1} />
        ))}
        <div style={{ height: 28 }} />
      </div>

      {/* frosted sticky header (title · search · filters) */}
      <VenueFeedHeader opacity={intro} />

      {/* soft fade so cards melt away at the bottom edge */}
      <div style={{ position: 'absolute', insetInline: 0, bottom: 0, height: 56, background: 'linear-gradient(0deg, rgba(251,250,247,0.92), transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

/* ── Scene B — Payments ───────────────────────── */
function Ring({ progress }: { progress: number }) {
  const size = 184, stroke = 13;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(22,38,63,0.12)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#reelgold)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
      />
      <defs>
        <linearGradient id="reelgold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD_HI} />
          <stop offset="100%" stopColor={GOLD} />
        </linearGradient>
      </defs>
    </svg>
  );
}

const PEOPLE = [
  { name: 'Ana', amount: 50 },
  { name: 'Carlos', amount: 40 },
  { name: 'Lucía', amount: 35 },
];

function PaymentScreen({ frame, fps, start }: { frame: number; fps: number; start: number }) {
  const local = frame - start;
  const progress = interpolate(local, [8, 52], [0, 0.78], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const raised = Math.round(progress * 1800);

  return (
    <div style={screen}>
      <AppBar title="Shared gift" />

      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 22, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: GOLD }}>
              Birthday surprise
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, color: INK1, marginTop: 3, letterSpacing: -0.3 }}>
              For Lucía
            </div>
          </div>
          <div
            style={{
              fontSize: 12, fontWeight: 700, color: GOLD,
              background: 'rgba(176,131,46,0.12)', border: '1px solid rgba(176,131,46,0.4)',
              padding: '4px 10px', borderRadius: 999,
            }}
          >
            {Math.round(progress * 100)}%
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '18px 0 4px' }}>
          <Ring progress={progress} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: INK1, letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>
              ${raised.toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: INK3, marginTop: 2 }}>of $1,800</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
        {PEOPLE.map((p, i) => {
          const appear = spring({ frame: local - (16 + i * 12), fps, config: { damping: 16, stiffness: 120 } });
          return (
            <div
              key={p.name}
              style={{
                opacity: appear,
                transform: `translateY(${interpolate(appear, [0, 1], [12, 0])}px)`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: BG2, border: `1px solid ${LINE}`, borderRadius: 14, padding: '11px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div
                  style={{
                    width: 30, height: 30, borderRadius: '50%', background: NAVY, color: CREAM,
                    fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {p.name[0]}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500, color: INK2 }}>{p.name}</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: INK1 }}>+${p.amount}</span>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />
      <div
        style={{
          height: 48, borderRadius: 13, background: GOLD, color: '#fff', fontWeight: 600, fontSize: 15.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        Chip in
      </div>
    </div>
  );
}

/* ── Screen scenes (venues → payments) ────────── */
/* ── Scene — Set the goal (create a shared gift) ── */
function CreateScreen({ frame, start }: { frame: number; start: number }) {
  const local = frame - start;
  const eo = (a: number, b: number) =>
    interpolate(local, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const hdr = eo(0, 16);
  const btn = eo(50, 64);
  const fields = [
    { label: 'Occasion', value: 'Birthday 🎂', a: eo(10, 24) },
    { label: 'For', value: 'Lucía', a: eo(22, 36) },
    { label: 'Goal amount', value: '$1,800', a: eo(34, 48) },
  ];
  return (
    <div style={screen}>
      <div style={{ opacity: hdr, transform: `translateY(${(1 - hdr) * 8}px)`, marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>New gift</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: INK1, letterSpacing: -0.3 }}>Create a shared gift</div>
      </div>
      {fields.map(({ label, value, a }) => (
        <div key={label} style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)`, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: INK3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
          <div style={{ height: 46, borderRadius: 13, border: `1px solid ${LINE}`, background: CARD, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, color: INK1, fontWeight: 500 }}>{value}</div>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ opacity: btn, transform: `translateY(${(1 - btn) * 12}px)`, height: 50, borderRadius: 13, background: GOLD, color: '#fff', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        Create gift
        <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
}

/* ── Screen scenes (venues → set the goal → payments) ── */
function ScreenScenes({ frame, fps }: { frame: number; fps: number }) {
  const b1 = interpolate(frame, [H1 - 12, H1 + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const b2 = interpolate(frame, [H2 - 12, H2 + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - b1, transform: `translateY(${b1 * -44}px) scale(${1 - b1 * 0.05})` }}>
        <VenueScreen frame={frame} />
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: b1 * (1 - b2), transform: `translateY(${(1 - b1) * 60 - b2 * 44}px) scale(${0.96 + b1 * 0.04 - b2 * 0.05})` }}>
        <CreateScreen frame={frame} start={H1} />
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: b2, transform: `translateY(${(1 - b2) * 60}px) scale(${0.96 + b2 * 0.04})` }}>
        <PaymentScreen frame={frame} fps={fps} start={H2} />
      </div>
    </>
  );
}

const SignalIcon = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" fill={INK1}><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13" y="0" width="3" height="11" rx="0.5" opacity="0.4" /></svg>
);
const BatteryIcon = () => (
  <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke={INK1} opacity="0.5" /><rect x="2" y="2" width="13" height="7" rx="1.2" fill={INK1} /><rect x="20" y="3.5" width="1.5" height="4" rx="0.75" fill={INK1} opacity="0.5" /></svg>
);

/* ── Composition — a real 3D device ───────────── */
const LAYERS = 22;

function Phone3D() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scroll (→ frame) turns the device through space; gentle sway + float add life.
  const ry = interpolate(frame, [0, DURATION - 1], [-22, 15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }) + Math.sin(frame / 42) * 1.6;
  const rx = -6 + Math.sin(frame / 60) * 1.4;
  const floatY = Math.sin(frame / 48) * 7;
  const spec = interpolate(ry, [-26, 18], [0.05, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: 'transparent', fontFamily: FONT_SANS }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', perspective: 1500, perspectiveOrigin: '50% 42%' }}>
        {/* contact shadow */}
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: PW * 0.78, height: 46,
            transform: `translate(-50%, ${PH * 0.43}px) scale(${1 - Math.abs(ry) / 130})`,
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(15,18,24,0.32), transparent 72%)',
            filter: 'blur(10px)',
          }}
        />

        {/* device */}
        <div style={{ width: PW, height: PH, position: 'relative', transformStyle: 'preserve-3d', transform: `translateY(${floatY}px) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
          {/* extruded body (stacked silhouettes build the side walls) */}
          {Array.from({ length: LAYERS }).map((_, i) => {
            const f = i / (LAYERS - 1);
            const z = -DEPTH / 2 + f * DEPTH;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', inset: 0, borderRadius: R,
                  background: `linear-gradient(150deg, #3a3e46, #101218)`,
                  transform: `translateZ(${z}px)`,
                  backfaceVisibility: 'hidden',
                }}
              />
            );
          })}

          {/* back plate */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: R, transform: `translateZ(${-DEPTH / 2 - 0.5}px) rotateY(180deg)`, background: 'linear-gradient(160deg, #2b2e35, #0f1116)', backfaceVisibility: 'hidden' }}>
            <div style={{ position: 'absolute', top: 26, left: 26, width: 70, height: 70, borderRadius: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          </div>

          {/* front glass + screen */}
          <div
            style={{
              position: 'absolute', inset: 0, borderRadius: R,
              transform: `translateZ(${DEPTH / 2 + 0.5}px)`,
              background: 'linear-gradient(155deg, #23262d, #0e1015)',
              padding: 9,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
              backfaceVisibility: 'hidden',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: R - 9, overflow: 'hidden', background: BG }}>
              <ScreenScenes frame={frame} fps={fps} />

              {/* status bar */}
              <div style={{ position: 'absolute', insetInline: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 26px 0', color: INK1, fontSize: 12, fontWeight: 600 }}>
                <span>9:41</span>
                <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}><SignalIcon /><BatteryIcon /></span>
              </div>
              {/* dynamic island */}
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 96, height: 26, borderRadius: 99, background: '#08090c' }} />
              {/* home indicator */}
              <div style={{ position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)', width: 118, height: 5, borderRadius: 99, background: 'rgba(22,38,63,0.22)' }} />
              {/* glass reflection (shifts with angle) */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(${112 + ry}deg, rgba(255,255,255,${spec}) 0%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 100%)` }} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ── Scroll-driven section ────────────────────── */
function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

const SCENES = [
  { eyebrow: 'Venues', title: 'Find the space.', body: 'Scroll a feed of curated venues — every space ready to host your celebration.', cta: 'Explore venues', href: '/venues' },
  { eyebrow: 'Shared gifts', title: 'Set the goal.', body: 'Create a shared gift in seconds — name it, set a target, and get one link to share.', cta: 'Create a gift', href: '/gifts/create' },
  { eyebrow: 'Guests pay', title: 'Split the gift.', body: 'One link. Each guest pays their share and the goal fills itself.', cta: 'Start a gift', href: '/gifts/create' },
];

/* Tracks the desktop breakpoint (md). Starts `null` until measured so we can
   avoid mounting the heavy scroll-driven Remotion player on phones at all. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

const CtaArrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ── Mobile: a static phone screen (no scroll-jacking, no Remotion) ── */
function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[290px]" style={{ background: 'linear-gradient(155deg,#23262d,#0e1015)', borderRadius: 40, padding: 9, boxShadow: '0 30px 60px -30px rgba(15,18,24,0.5)' }}>
      <div style={{ position: 'relative', borderRadius: 31, overflow: 'hidden', background: BG }}>
        {/* dynamic island */}
        <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 78, height: 21, borderRadius: 99, background: '#08090c', zIndex: 2 }} />
        {children}
      </div>
    </div>
  );
}

function VenueScreenStatic() {
  return (
    <div style={{ padding: '40px 16px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 21, color: INK1, letterSpacing: -0.3 }}>Venues</div>
        <Dots />
      </div>
      <div style={{ height: 38, borderRadius: 12, background: CARD, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', marginBottom: 14 }}>
        <SearchIcon />
        <span style={{ fontSize: 13, color: INK3 }}>Search spaces…</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {VENUES.slice(0, 3).map((v, i) => (
          <VenueCard key={v.name} v={v} seed={i + 1} />
        ))}
      </div>
    </div>
  );
}

function PaymentScreenStatic() {
  const progress = 0.78;
  return (
    <div style={{ padding: '40px 18px 22px', display: 'flex', flexDirection: 'column' }}>
      <AppBar title="Shared gift" />
      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: GOLD }}>Birthday surprise</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 19, color: INK1, marginTop: 3 }}>For Lucía</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: 'rgba(176,131,46,0.12)', border: '1px solid rgba(176,131,46,0.4)', padding: '3px 9px', borderRadius: 999 }}>78%</div>
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '14px 0 2px' }}>
          <Ring progress={progress} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: INK1, letterSpacing: -1 }}>$1,404</div>
            <div style={{ fontSize: 12, color: INK3, marginTop: 2 }}>of $1,800</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {PEOPLE.map((p) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: BG2, border: `1px solid ${LINE}`, borderRadius: 13, padding: '9px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: NAVY, color: CREAM, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.name[0]}</div>
              <span style={{ fontSize: 14, fontWeight: 500, color: INK2 }}>{p.name}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: INK1 }}>+${p.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateScreenStatic() {
  const fields = [
    { label: 'Occasion', value: 'Birthday 🎂' },
    { label: 'For', value: 'Lucía' },
    { label: 'Goal amount', value: '$1,800' },
  ];
  return (
    <div style={{ padding: '40px 16px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: GOLD, marginBottom: 5 }}>New gift</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, color: INK1, letterSpacing: -0.3 }}>Create a shared gift</div>
      </div>
      {fields.map(({ label, value }) => (
        <div key={label} style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: INK3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
          <div style={{ height: 44, borderRadius: 13, border: `1px solid ${LINE}`, background: CARD, display: 'flex', alignItems: 'center', padding: '0 13px', fontSize: 14.5, color: INK1, fontWeight: 500 }}>{value}</div>
        </div>
      ))}
      <div style={{ marginTop: 5, height: 46, borderRadius: 13, background: GOLD, color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Create gift</div>
    </div>
  );
}

function MobileShowcase() {
  const visuals = [<VenueScreenStatic key="v" />, <CreateScreenStatic key="c" />, <PaymentScreenStatic key="p" />];
  return (
    <section className="wrap py-16">
      <div className="mb-12 text-center">
        <p className="t-label-amber mb-3">How it works</p>
        <h2 className="t-title">From the space to the gift</h2>
      </div>
      <div className="flex flex-col gap-16">
        {SCENES.map((s, i) => (
          <div key={s.eyebrow} className="flex flex-col items-center gap-7">
            <PhoneShell>{visuals[i]}</PhoneShell>
            <div className="max-w-sm text-center">
              <p className="t-label-amber mb-2">{s.eyebrow}</p>
              <h3 className="t-title mb-3">{s.title}</h3>
              <p className="t-body">{s.body}</p>
              <a href={s.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--amber)]">
                {s.cta}
                <CtaArrow />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ScrollPhoneReel() {
  const isDesktop = useIsDesktop();
  const sectionRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phoneH, setPhoneH] = useState(620);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted || !isDesktop) return;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const vh = window.innerHeight;
      const distance = el.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(distance, 1));
      const p = distance > 0 ? scrolled / distance : 0;
      setProgress(p);
      try { playerRef.current?.seekTo(Math.round(p * (DURATION - 1))); } catch { /* noop */ }
    };
    const onResize = () => {
      // Two-column layout: the phone owns its half, so it can fill nearly the
      // full viewport height (just a little breathing room top/bottom).
      const avail = (window.innerHeight - 64) - 96;
      setPhoneH(Math.max(520, Math.min(880, avail)));
      onScroll();
    };
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [mounted, isDesktop]);

  // Phones get a static, in-flow showcase instead of the scroll-driven 3D reel.
  // Default (incl. SSR / before measurement) to the lightweight showcase so the
  // section always shows real content — the heavy reel only mounts on desktop.
  if (!isDesktop) return <MobileShowcase />;

  // Three scenes: venues → set the goal → guests pay. Captions crossfade in thirds.
  const t1 = smoothstep(0.30, 0.42, progress); // venues → set the goal
  const t2 = smoothstep(0.64, 0.76, progress); // set the goal → guests pay
  const caps = [1 - t1, t1 * (1 - t2), t2];
  // Phone rises + settles as the section pins, then holds; a whisper of exit at the very end.
  const enter = smoothstep(0, 0.1, progress);
  const exit = smoothstep(0.9, 1, progress);
  const phoneScale = 0.92 + enter * 0.08 - exit * 0.03;
  const phoneY = (1 - enter) * 36 + exit * -24;
  const canvasW = phoneH * (CANVAS_W / CANVAS_H);
  const phoneW = phoneH * 0.44; // approx visible device width (for the glow)

  return (
    <section ref={sectionRef} className="relative" style={{ height: '420vh' }}>
      <div className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        {/* soft stage glow behind the phone (right half) */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[24%] top-1/2 -translate-y-1/2 translate-x-1/2"
          style={{
            width: phoneW * 3, height: phoneW * 3,
            background: 'radial-gradient(circle, rgba(176,131,46,0.14), transparent 62%)',
            opacity: 0.5 + enter * 0.5,
          }}
        />

        <div className="wrap grid h-full grid-cols-2 items-center gap-10 lg:gap-16">
          {/* Left — crossfading copy, large and readable */}
          <div className="relative z-10 h-[420px]">
            {SCENES.map((s, i) => {
              const v = caps[i];
              return (
                <div
                  key={s.eyebrow}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ opacity: v, pointerEvents: v > 0.5 ? 'auto' : 'none', transform: `translateY(${(1 - v) * 18}px)` }}
                >
                  <p className="t-label-amber mb-4">{s.eyebrow}</p>
                  <h2 className="t-display" style={{ fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)', lineHeight: 1.03 }}>{s.title}</h2>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--ink-2)]">{s.body}</p>
                  <a href={s.href} className="btn btn-primary btn-lg mt-8 w-fit">
                    {s.cta}
                    <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                </div>
              );
            })}

            {/* scene rail */}
            <div className="absolute bottom-0 left-0 flex gap-2">
              {caps.map((v, i) => (
                <span key={i} className="h-1.5 rounded-full" style={{ width: 10 + v * 22, background: `rgba(176,131,46,${0.25 + v * 0.75})`, transition: 'none' }} />
              ))}
            </div>
          </div>

          {/* Right — the 3D phone, filling its column */}
          <div className="relative z-10 flex items-center justify-center">
            <div style={{ height: phoneH, width: canvasW, transform: `translateY(${phoneY}px) scale(${phoneScale})`, transition: 'none' }}>
              <Phone3DPlayer mounted={mounted} playerRef={playerRef} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Phone3DPlayer({ mounted, playerRef }: { mounted: boolean; playerRef: React.RefObject<PlayerRef | null> }) {
  if (!mounted) return <div style={{ width: '100%', height: '100%' }} />;
  return (
    <Player
      ref={playerRef}
      component={Phone3D}
      durationInFrames={DURATION}
      fps={FPS}
      compositionWidth={CANVAS_W}
      compositionHeight={CANVAS_H}
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    />
  );
}

export default ScrollPhoneReel;
