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
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════
   CENIT — Shared-gift step-by-step explainer (Remotion)
   4 scenes: Create → Share → Guests pay → Goal reached.
   Scroll-driven on desktop, static cards on mobile.
═══════════════════════════════════════════════════════ */

// ── Brand tokens ────────────────────────────────────────
const NAVY    = '#16263F';
const GOLD    = '#B0832E';
const GOLD_HI = '#D8B061';
const CREAM   = '#F5F1E8';
const BG      = '#FBFAF7';
const CARD    = '#FFFFFF';
const BG2     = '#F4F1EA';
const INK1    = '#16263F';
const INK2    = 'rgba(22,38,63,0.66)';
const INK3    = 'rgba(22,38,63,0.45)';
const LINE    = 'rgba(22,38,63,0.12)';
const GREEN   = '#2e7d32';

const FPS          = 30;
const TOTAL_FRAMES = 320;
const CANVAS_W     = 400;
const CANVAS_H     = 800;
const FADE         = 18;
const S            = [0, 80, 160, 240] as const; // scene start frames

const FONT_D = 'var(--font-fraunces), Georgia, serif';
const FONT_S = 'var(--font-inter), Inter, system-ui, sans-serif';

// ── Ease-out interpolation shorthand ────────────────────
const eo = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

/* ═══════════════════════════════════════════════════════
   SCENE 1 — Create a gift
═══════════════════════════════════════════════════════ */
function S1Create({ frame }: { frame: number }) {
  const f   = frame - S[0];
  const hdr = eo(f, 0, 18);
  const f1  = eo(f, 10, 24);
  const f2  = eo(f, 22, 36);
  const f3  = eo(f, 34, 48);
  const btn = eo(f, 52, 66);

  const fields = [
    { label: 'Occasion', value: 'Birthday 🎂', a: f1 },
    { label: 'For', value: 'Lucía', a: f2 },
    { label: 'Goal amount', value: '$1,800', a: f3 },
  ];

  return (
    <div style={{ padding: '56px 20px 22px', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: FONT_S }}>
      <div style={{ opacity: hdr, transform: `translateY(${(1 - hdr) * 8}px)`, marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: GOLD, marginBottom: 5 }}>New gift</div>
        <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 23, color: INK1, letterSpacing: -0.3 }}>Create a shared gift</div>
      </div>

      {fields.map(({ label, value, a }) => (
        <div key={label} style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)`, marginBottom: 11 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: INK3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
          <div style={{ height: 44, borderRadius: 13, border: `1.5px solid ${LINE}`, background: CARD, display: 'flex', alignItems: 'center', padding: '0 13px', fontSize: 14.5, color: INK1, fontWeight: 500, boxShadow: '0 1px 3px rgba(22,38,63,0.04)' }}>
            {value}
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ opacity: btn, transform: `translateY(${(1 - btn) * 12}px)` }}>
        <div style={{ height: 48, borderRadius: 13, background: GOLD, color: '#fff', fontWeight: 700, fontSize: 15.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 8px 24px -8px ${GOLD}` }}>
          Create gift
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 2 — Share the link
═══════════════════════════════════════════════════════ */
function S2Share({ frame, fps }: { frame: number; fps: number }) {
  const f   = frame - S[1];
  const chk = spring({ frame: f - 2, fps, config: { damping: 12, stiffness: 200 } });
  const hdr = eo(f, 4, 20);
  const lnk = eo(f, 16, 30);
  const bts = eo(f, 28, 44);
  const gst = eo(f, 44, 60);

  return (
    <div style={{ padding: '56px 20px 22px', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: FONT_S }}>
      <div style={{ opacity: hdr, display: 'flex', alignItems: 'center', gap: 11, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(46,125,50,0.12)', border: '1.5px solid rgba(46,125,50,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${chk})`, flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: GREEN, marginBottom: 3 }}>Gift created!</div>
          <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 19, color: INK1 }}>Now share it</div>
        </div>
      </div>

      <div style={{ opacity: lnk, transform: `translateY(${(1 - lnk) * 10}px)`, marginBottom: 11 }}>
        <div style={{ background: BG2, borderRadius: 15, padding: 15, border: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: INK3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 }}>Shareable link</div>
          <div style={{ fontSize: 13, color: NAVY, fontWeight: 600, fontFamily: 'monospace', background: CARD, borderRadius: 9, padding: '9px 11px', border: `1px solid ${LINE}`, letterSpacing: 0.3 }}>
            cenit.app/<span style={{ color: GOLD }}>A1B2C3D4</span>
          </div>
        </div>
      </div>

      <div style={{ opacity: bts, transform: `translateY(${(1 - bts) * 8}px)`, display: 'flex', gap: 8, marginBottom: 18 }}>
        {(['Copy link', 'Send'] as const).map((lbl, i) => (
          <div key={lbl} style={{ flex: 1, height: 42, borderRadius: 11, background: i === 1 ? GOLD : BG2, color: i === 1 ? '#fff' : INK1, border: `1px solid ${i === 1 ? GOLD : LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600 }}>
            {lbl}
          </div>
        ))}
      </div>

      <div style={{ opacity: gst, transform: `translateY(${(1 - gst) * 8}px)` }}>
        <div style={{ fontSize: 11.5, color: INK3, fontWeight: 500, marginBottom: 9 }}>Send to your guests</div>
        <div style={{ display: 'flex', gap: 7 }}>
          {(['Ana', 'Carlos', 'María', '+5'] as const).map((nm, i) => (
            <div key={nm} style={{ width: 40, height: 40, borderRadius: '50%', background: [NAVY, '#3a4a3f', '#4a3f2a', BG2][i], color: i === 3 ? INK2 : CREAM, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${CARD}`, boxShadow: '0 2px 6px rgba(22,38,63,0.14)' }}>
              {nm[0]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 3 — Guests contribute
═══════════════════════════════════════════════════════ */
const GUEST_LIST = [
  { name: 'Ana', amt: 50 },
  { name: 'Carlos', amt: 40 },
  { name: 'María', amt: 35 },
  { name: 'Sofía', amt: 60 },
  { name: 'Jorge', amt: 45 },
];

function S3Pay({ frame, fps }: { frame: number; fps: number }) {
  const f    = frame - S[2];
  const hdr  = eo(f, 0, 16);
  const prog = interpolate(f, [8, 68], [0, 0.78], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const raised = Math.round(prog * 1800);

  return (
    <div style={{ padding: '56px 18px 20px', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: FONT_S }}>
      <div style={{ opacity: hdr, transform: `translateY(${(1 - hdr) * 8}px)`, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: GOLD, marginBottom: 4 }}>Guest view · no account needed</div>
        <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 20, color: INK1, letterSpacing: -0.3 }}>Birthday for Lucía</div>
      </div>

      <div style={{ opacity: hdr, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
          <span style={{ fontSize: 21, fontWeight: 700, color: INK1, letterSpacing: -0.5 }}>${raised.toLocaleString()}</span>
          <span style={{ fontSize: 11.5, color: INK3 }}>of $1,800</span>
        </div>
        <div style={{ height: 7, borderRadius: 99, background: LINE, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${GOLD_HI},${GOLD})`, width: `${prog * 100}%` }} />
        </div>
        <div style={{ marginTop: 3, fontSize: 10.5, color: INK3 }}>{Math.round(prog * 100)}% of goal reached</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflow: 'hidden' }}>
        {GUEST_LIST.map((g, i) => {
          const ap = spring({ frame: f - (6 + i * 10), fps, config: { damping: 16, stiffness: 130 } });
          return (
            <div key={g.name} style={{ opacity: ap, transform: `translateX(${interpolate(ap, [0, 1], [-18, 0])}px)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: BG2, border: `1px solid ${LINE}`, borderRadius: 12, padding: '8px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: NAVY, color: CREAM, fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{g.name[0]}</div>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: INK2 }}>{g.name}</span>
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: INK1 }}>+${g.amt}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 9 }}>
        <div style={{ height: 46, borderRadius: 12, background: GOLD, color: '#fff', fontWeight: 600, fontSize: 14.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Chip in · $60
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE 4 — Goal reached
═══════════════════════════════════════════════════════ */
function S4Done({ frame, fps }: { frame: number; fps: number }) {
  const f      = frame - S[3];
  const intro  = eo(f, 0, 16);
  const ring   = interpolate(f, [6, 52], [0.78, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const bounce = spring({ frame: f - 50, fps, config: { damping: 7, stiffness: 100 } });
  const payout = eo(f, 54, 70);

  const sz   = 148;
  const sw   = 12;
  const rad  = (sz - sw) / 2;
  const circ = 2 * Math.PI * rad;

  const dots: [number, number, number, string, number][] = [
    [44, 178, 5, GOLD_HI, 46], [84, 154, 4, GOLD, 50], [238, 166, 5, GOLD_HI, 48],
    [196, 146, 3, GOLD, 52],   [162, 138, 4, GOLD_HI, 47], [118, 158, 3, GOLD, 53],
  ];

  return (
    <div style={{ padding: '56px 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', fontFamily: FONT_S, position: 'relative', overflow: 'hidden' }}>
      {dots.map(([x, y, r, c, d], i) => {
        const dy  = interpolate(f, [d, d + 26], [0, -42], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const dop = interpolate(f, [d, d + 4, d + 22, d + 26], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: c, opacity: dop, transform: `translateY(${dy}px)` }} />;
      })}

      <div style={{ opacity: intro, alignSelf: 'flex-start', width: '100%', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: GREEN, marginBottom: 4 }}>Goal reached 🎉</div>
        <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 21, color: INK1, letterSpacing: -0.3 }}>Birthday for Lucía</div>
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16, transform: `scale(${1 + bounce * 0.04})` }}>
        <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={sz / 2} cy={sz / 2} r={rad} fill="none" stroke="rgba(22,38,63,0.10)" strokeWidth={sw} />
          <circle cx={sz / 2} cy={sz / 2} r={rad} fill="none" stroke="url(#gg-exp)" strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} />
          <defs>
            <linearGradient id="gg-exp" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={GOLD_HI} />
              <stop offset="100%" stopColor={GOLD} />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 27, fontWeight: 700, color: INK1, letterSpacing: -0.8 }}>$1,800</div>
          <div style={{ fontSize: 11.5, color: GREEN, fontWeight: 700, marginTop: 2 }}>100% funded</div>
        </div>
      </div>

      <div style={{ width: '100%', borderRadius: 15, background: BG2, border: `1px solid ${LINE}`, padding: '11px 15px', marginBottom: 12, opacity: intro, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11.5, color: INK3, marginBottom: 2 }}>Total contributors</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: INK1 }}>8 guests</div>
        </div>
        <div style={{ display: 'flex' }}>
          {['A', 'C', 'M', 'S'].map((l, i) => (
            <div key={l} style={{ width: 27, height: 27, borderRadius: '50%', background: NAVY, color: CREAM, fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${CARD}`, marginLeft: i > 0 ? -7 : 0 }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', opacity: payout, transform: `translateY(${(1 - payout) * 10}px)` }}>
        <div style={{ height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#2a6e2e,#3a8e3e)', color: '#fff', fontWeight: 700, fontSize: 15.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px -8px rgba(46,125,50,0.45)' }}>
          Claim $1,800
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPOSITION — all 4 scenes inside one phone shell
═══════════════════════════════════════════════════════ */
function GiftFlow() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blend = (threshold: number) =>
    interpolate(frame, [threshold - FADE / 2, threshold + FADE / 2], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });

  const b12 = blend(S[1]);
  const b23 = blend(S[2]);
  const b34 = blend(S[3]);

  const scenes: { op: number; dy: number; el: React.ReactNode }[] = [
    { op: 1 - b12,           dy: b12 * -26,           el: <S1Create frame={frame} /> },
    { op: b12 * (1 - b23),   dy: (1 - b12) * 26 - b23 * 26,   el: <S2Share frame={frame} fps={fps} /> },
    { op: b23 * (1 - b34),   dy: (1 - b23) * 26 - b34 * 26,   el: <S3Pay frame={frame} fps={fps} /> },
    { op: b34,                dy: (1 - b34) * 26,       el: <S4Done frame={frame} fps={fps} /> },
  ];

  return (
    <AbsoluteFill style={{ background: 'transparent', fontFamily: FONT_S }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 302, height: 650, background: 'linear-gradient(155deg,#23262d,#0e1015)', borderRadius: 48, padding: 9, boxShadow: '0 48px 96px -36px rgba(15,18,24,0.65), 0 0 0 1px rgba(255,255,255,0.04)' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 39, overflow: 'hidden', background: BG }}>
            {/* dynamic island */}
            <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 84, height: 23, borderRadius: 99, background: '#08090c', zIndex: 10 }} />
            {/* status bar */}
            <div style={{ position: 'absolute', insetInline: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 23px 0', color: INK1, fontSize: 11.5, fontWeight: 600, fontFamily: FONT_S, zIndex: 9, pointerEvents: 'none' }}>
              <span>9:41</span>
              <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <svg width="15" height="10" viewBox="0 0 16 11" fill={INK1}><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13" y="0" width="3" height="11" rx="0.5" opacity="0.4" /></svg>
                <svg width="20" height="10" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke={INK1} opacity="0.5" /><rect x="2" y="2" width="13" height="7" rx="1.2" fill={INK1} /><rect x="20" y="3.5" width="1.5" height="4" rx="0.75" fill={INK1} opacity="0.5" /></svg>
              </span>
            </div>
            {/* home indicator */}
            <div style={{ position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)', width: 106, height: 4, borderRadius: 99, background: 'rgba(22,38,63,0.20)', zIndex: 9 }} />
            {/* scenes */}
            {scenes.map((s, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, opacity: s.op, transform: `translateY(${s.dy}px)` }}>
                {s.el}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ═══════════════════════════════════════════════════════
   SCROLL SECTION DATA
═══════════════════════════════════════════════════════ */
const STEPS = [
  {
    eyebrow: 'Step 1 · Create',
    title: 'Set the goal.',
    body: 'The organizer picks an occasion, adds a name, and sets a target amount. The gift is live in seconds.',
  },
  {
    eyebrow: 'Step 2 · Share',
    title: 'Send one link.',
    body: 'A unique code and shareable link are generated. Send it via WhatsApp, email, or anywhere guests can reach.',
  },
  {
    eyebrow: 'Step 3 · Guests pay',
    title: 'Each friend chips in.',
    body: 'Guests open the link and pay their share through Stripe. No account, no app — just one tap.',
  },
  {
    eyebrow: 'Step 4 · Done',
    title: 'Goal reached.',
    body: 'Once fully funded, the organizer claims the total straight to their bank. Zero hassle.',
  },
] as const;

function stepOpacity(progress: number, i: number): number {
  const n     = STEPS.length;
  const start = i / n;
  const end   = (i + 1) / n;
  const fade  = 0.04;
  const fadeIn  = i === 0 ? 1 : Math.min(1, Math.max(0, (progress - (start - fade)) / (fade * 2)));
  const fadeOut = i === n - 1 ? 1 : Math.min(1, Math.max(0, (end + fade - progress) / (fade * 2)));
  return Math.min(fadeIn, fadeOut);
}

/* ── Detect desktop breakpoint (avoids SSR mismatch) ── */
function useIsDesktop() {
  const [val, setVal] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const upd = () => setVal(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);
  return val;
}

/* ═══════════════════════════════════════════════════════
   MOBILE — static step cards
═══════════════════════════════════════════════════════ */
const STEP_ICONS = [
  // Create
  <svg key="create" width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="6" width="20" height="16" rx="3" stroke="#B0832E" strokeWidth="1.6"/><path d="M9 11h10M9 15h6" stroke="#B0832E" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  // Share
  <svg key="share" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="21" cy="8" r="3" stroke="#B0832E" strokeWidth="1.5"/><circle cx="7" cy="14" r="3" stroke="#B0832E" strokeWidth="1.5"/><circle cx="21" cy="20" r="3" stroke="#B0832E" strokeWidth="1.5"/><path d="M10 12.5l8-3.5M10 15.5l8 3.5" stroke="#B0832E" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  // Pay
  <svg key="pay" width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="9" width="20" height="13" rx="3" stroke="#B0832E" strokeWidth="1.5"/><path d="M4 13h20" stroke="#B0832E" strokeWidth="1.5"/><circle cx="9" cy="17" r="1.5" fill="#B0832E"/></svg>,
  // Done
  <svg key="done" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="9" stroke="#2e7d32" strokeWidth="1.5"/><path d="M10 14l3 3 5-5" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
];

function MobileSteps() {
  return (
    <section className="wrap py-16">
      <div className="mb-12 text-center">
        <p className="t-label-amber mb-3">How shared gifts work</p>
        <h2 className="t-title">From idea to funded — step by step</h2>
      </div>
      <div className="flex flex-col gap-5">
        {STEPS.map((s, i) => (
          <div key={i} className="card card-p flex gap-5 items-start">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-[var(--bg-2)] flex items-center justify-center border border-[var(--line)]">
              {STEP_ICONS[i]}
            </div>
            <div>
              <p className="t-label-amber mb-1">{s.eyebrow}</p>
              <h3 className="text-base font-semibold text-[var(--ink-1)] mb-1">{s.title}</h3>
              <p className="text-sm leading-6 text-[var(--ink-2)]">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/gifts/create" className="btn btn-primary btn-lg">Start a shared gift</Link>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   DESKTOP — scroll-driven Remotion explainer
═══════════════════════════════════════════════════════ */
function GiftFlowPlayer({ mounted, playerRef }: { mounted: boolean; playerRef: React.RefObject<PlayerRef | null> }) {
  if (!mounted) return <div style={{ width: '100%', height: '100%' }} />;
  return (
    <Player
      ref={playerRef}
      component={GiftFlow}
      durationInFrames={TOTAL_FRAMES}
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

/* ═══════════════════════════════════════════════════════
   EXPORT — GiftExplainer
═══════════════════════════════════════════════════════ */
export function GiftExplainer() {
  const isDesktop  = useIsDesktop();
  const sectionRef = useRef<HTMLDivElement>(null);
  const playerRef  = useRef<PlayerRef>(null);
  const [mounted,  setMounted]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [phoneH,   setPhoneH]   = useState(580);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted || !isDesktop) return;

    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const distance = el.offsetHeight - window.innerHeight;
      const scrolled  = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(distance, 1));
      const p = distance > 0 ? scrolled / distance : 0;
      setProgress(p);
      try { playerRef.current?.seekTo(Math.round(p * (TOTAL_FRAMES - 1))); } catch { /* noop */ }
    };

    const onResize = () => {
      const avail = (window.innerHeight - 64) - 160;
      setPhoneH(Math.max(440, Math.min(780, avail)));
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

  if (!isDesktop) return <MobileSteps />;

  const canvasW = phoneH * (CANVAS_W / CANVAS_H);

  return (
    <section ref={sectionRef} className="relative" style={{ height: '480vh' }}>
      {/* ── Sticky panel ── */}
      <div className="sticky top-16 flex h-[calc(100svh-64px)] flex-col items-center justify-center overflow-hidden">
        {/* stage glow */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: canvasW * 1.8, height: canvasW * 1.8, background: 'radial-gradient(circle, rgba(176,131,46,0.09), transparent 60%)', opacity: 0.6 + progress * 0.4 }} />

        {/* section eyebrow (fades out after first step) */}
        <div className="relative z-10 mb-2 text-center" style={{ opacity: 1 - stepOpacity(progress, 0) * 0 }}>
          <p className="t-label-amber">Shared gifts · step by step</p>
        </div>

        {/* top caption — step title */}
        <div className="relative z-10 mb-5 h-[68px] w-full px-6 text-center">
          {STEPS.map((s, i) => {
            const v = stepOpacity(progress, i);
            return (
              <div key={i} className="absolute inset-x-0 top-0 flex flex-col items-center" style={{ opacity: v, transform: `translateY(${(1 - v) * 10}px)`, transition: 'none' }}>
                <p className="t-label-amber mb-2">{s.eyebrow}</p>
                <h2 className="t-title">{s.title}</h2>
              </div>
            );
          })}
        </div>

        {/* phone */}
        <div className="relative z-10" style={{ height: phoneH, width: canvasW }}>
          <GiftFlowPlayer mounted={mounted} playerRef={playerRef} />
        </div>

        {/* bottom caption — step description */}
        <div className="relative z-10 mt-5 h-[72px] w-full px-6 text-center">
          {STEPS.map((s, i) => {
            const v = stepOpacity(progress, i);
            const isLast = i === STEPS.length - 1;
            return (
              <div key={i} className="absolute inset-x-0 top-0 flex flex-col items-center" style={{ opacity: v, pointerEvents: v > 0.5 ? 'auto' : 'none', transform: `translateY(${(1 - v) * 10}px)`, transition: 'none' }}>
                <p className="t-body max-w-sm">{s.body}</p>
                {isLast && (
                  <Link href="/gifts/create" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--amber)]">
                    Start a shared gift
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* step dot indicator */}
        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {STEPS.map((_, i) => {
            const v = stepOpacity(progress, i);
            return (
              <span key={i} className="h-1.5 rounded-full transition-none" style={{ width: 8 + v * 18, background: `rgba(176,131,46,${0.28 + v * 0.72})` }} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default GiftExplainer;
