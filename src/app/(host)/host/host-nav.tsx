'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/host', label: 'Overview' },
  { href: '/host/reservations', label: 'Reservations' },
  { href: '/host/availability', label: 'Availability' },
  { href: '/host/payments', label: 'Payments' },
];

export function HostNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-[var(--line)]">
      {tabs.map((tab) => {
        const active =
          tab.href === '/host' ? pathname === '/host' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'text-[var(--ink-1)]'
                : 'text-[var(--ink-3)] hover:text-[var(--ink-1)]'
            }`}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[var(--amber)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
