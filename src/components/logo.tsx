import Link from 'next/link';

/**
 * Cenit brand logotype — the lowercase "cenit" wordmark set in Fraunces,
 * with the signature antique-gold dot replacing the tittle on the "i"
 * ("el punto más alto" — the highest point).
 *
 * Built from live type (no image asset) so it stays crisp at any size and
 * always matches the brand font. Size it by setting font-size via `className`
 * (e.g. text-xl, text-3xl) — the gold dot scales in `em` units.
 */
export function Logo({
  href = '/',
  className = '',
  tone = 'cream',
  size = '1.65rem',
}: {
  href?: string | null;
  className?: string;
  tone?: 'cream' | 'navy';
  size?: string;
}) {
  const color = tone === 'navy' ? 'var(--navy)' : 'var(--ink-1)';

  const mark = (
    <span
      className="inline-flex items-baseline leading-none select-none"
      style={{
        fontFamily: 'var(--font-fraunces), Georgia, serif',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        color,
        fontSize: size,
      }}
      aria-label="Cenit"
    >
      cen
      {/* dotless i + detached gold dot */}
      <span className="relative inline-block" aria-hidden>
        {'ı'}
        <span
          className="absolute rounded-full"
          style={{
            background: 'var(--gold)',
            width: '0.19em',
            height: '0.19em',
            left: '56%',
            top: '-0.25em',
            transform: 'translateX(-50%)',
          }}
        />
      </span>
      t
    </span>
  );

  if (href === null) {
    return <span className={`inline-flex ${className}`}>{mark}</span>;
  }
  return (
    <Link href={href} className={`inline-flex shrink-0 ${className}`} aria-label="Cenit — home">
      {mark}
    </Link>
  );
}

export default Logo;
