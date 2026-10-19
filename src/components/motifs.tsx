/* ════════════════════════════════════════════════
   CENIT — Venue glyph
   A restrained, monochrome header for venue cards/detail
   (in place of photography): the venue's initial set in the
   brand serif, with a single small gold dot. Fills its
   relatively-positioned parent.
════════════════════════════════════════════════ */

export function VenueGlyph({ initial }: { initial: string }) {
  return (
    <div className="motif-bg absolute inset-0 grid place-items-center overflow-hidden">
      <span
        className="relative select-none text-7xl font-semibold"
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          color: 'rgba(22,38,63,0.16)',
          letterSpacing: '-0.02em',
        }}
      >
        {initial.toUpperCase()}
        {/* the one gold detail — the logo's tittle */}
        <span
          className="float-dot absolute rounded-full"
          style={{ width: 8, height: 8, top: 8, right: -2, background: 'var(--gold)' }}
        />
      </span>
    </div>
  );
}

export default VenueGlyph;
