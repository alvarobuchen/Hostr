'use client';

import { useEffect, useRef } from 'react';

/* ════════════════════════════════════════════════
   CENIT — Interactive confetti
   A few pieces drift down from the top. Move your cursor
   through them and they scatter away from it, then settle
   back into the fall. Canvas + a small physics loop
   (real-time, so it responds to the mouse).
════════════════════════════════════════════════ */

type Piece = {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; vrot: number;
  w: number; h: number;
  color: string;
  sway: number;     // phase for gentle horizontal sway
  swaySpeed: number;
};

const COLORS = [
  '#C49A4A', '#C49A4A', '#B0832E', '#D8B061', // gold — now the lead colour
  '#16263F', '#16263F',                        // logo navy for contrast on white
  '#8A6522',                                   // deep gold
  '#A8A29A',                                   // one soft grey
];

const COUNT = 26;
const MOUSE_RADIUS = 130;

export function ConfettiField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pieces: Piece[] = [];

    const spawn = (atTop: boolean): Piece => ({
      x: Math.random() * w,
      y: atTop ? -20 - Math.random() * 80 : Math.random() * h,
      vx: 0,
      vy: 0.35 + Math.random() * 0.5,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.05,
      w: 6 + Math.random() * 6,
      h: 9 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.015,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pieces.length === 0) pieces = Array.from({ length: COUNT }, () => spawn(false));
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onLeave, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pieces) {
        // cursor repulsion
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS && dist > 0.01) {
          const force = (1 - dist / MOUSE_RADIUS) * 1.4;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.vrot += force * 0.01;
        }

        // motion
        p.sway += p.swaySpeed;
        p.vx += Math.sin(p.sway) * 0.012;     // gentle drift
        p.vy += 0.012;                          // light gravity
        p.vx *= 0.94;                            // drag
        p.vy *= 0.97;
        if (p.vy < 0.3) p.vy = 0.3;             // keep falling
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.vrot *= 0.96;

        // wrap / respawn
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y > h + 30) Object.assign(p, spawn(true));

        // render
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.92;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    let raf = requestAnimationFrame(draw);
    if (reduced) { cancelAnimationFrame(raf); draw(); } // single static frame

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}

export default ConfettiField;
