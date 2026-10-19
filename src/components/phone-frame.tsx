/* ════════════════════════════════════════════════
   CENIT — Phone frame
   A minimal iPhone-style shell. Whatever you pass as
   children renders as the screen.
   • bleed — content fills the whole display (no safe-area pad)
   • fill  — the frame sizes to its parent's height (else width)
════════════════════════════════════════════════ */

export function PhoneFrame({
  children,
  bleed = false,
  fill = false,
  maxWidth = 300,
}: {
  children: React.ReactNode;
  bleed?: boolean;
  fill?: boolean;
  maxWidth?: number;
}) {
  return (
    <div
      className="relative mx-auto"
      style={fill ? { height: '100%', aspectRatio: '9 / 19' } : { width: '100%', maxWidth }}
    >
      {/* side buttons — percentage based so they scale with the frame */}
      <span aria-hidden className="absolute -left-[3px] w-[3px] rounded-l bg-[var(--bg-4)]" style={{ top: '19%', height: '5%' }} />
      <span aria-hidden className="absolute -left-[3px] w-[3px] rounded-l bg-[var(--bg-4)]" style={{ top: '26%', height: '7.5%' }} />
      <span aria-hidden className="absolute -left-[3px] w-[3px] rounded-l bg-[var(--bg-4)]" style={{ top: '35%', height: '7.5%' }} />
      <span aria-hidden className="absolute -right-[3px] w-[3px] rounded-r bg-[var(--bg-4)]" style={{ top: '28%', height: '10%' }} />

      {/* titanium body */}
      <div
        className="relative h-full rounded-[2.9rem] border border-[var(--line-2)] p-2.5"
        style={{
          background: 'linear-gradient(160deg, #2A2A2E, #161618)',
          boxShadow: '0 40px 90px -40px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* screen */}
        <div className={`relative h-full overflow-hidden rounded-[2.4rem] bg-[var(--bg)] ${fill ? '' : 'aspect-[9/19]'}`}>
          {/* dynamic island */}
          <div aria-hidden className="absolute left-1/2 top-3 z-20 h-6 w-[5.5rem] -translate-x-1/2 rounded-full bg-black" />

          {/* status bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-7 pt-3.5 text-[11px] font-semibold text-[var(--ink-1)]">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              {/* signal */}
              <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13" y="0" width="3" height="11" rx="0.5" opacity="0.4"/></svg>
              {/* battery */}
              <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="13" height="7" rx="1.2" fill="currentColor"/><rect x="20" y="3.5" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.5"/></svg>
            </span>
          </div>

          {/* screen content — bleed fills the whole display; otherwise clears the status bar + home indicator */}
          <div className={bleed ? 'absolute inset-0' : 'absolute inset-0 px-3 pb-7 pt-11'}>
            {children}
          </div>

          {/* home indicator */}
          <div aria-hidden className="absolute bottom-2 left-1/2 z-10 h-1 w-28 -translate-x-1/2 rounded-full bg-[var(--ink-4)]" />
        </div>
      </div>
    </div>
  );
}

export default PhoneFrame;
