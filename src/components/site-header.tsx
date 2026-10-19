'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Logo } from '@/components/logo';

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navItems = user
    ? [
        { href: '/',       label: t('nav.home')   },
        { href: '/venues', label: t('nav.venues') },
        { href: '/gifts',  label: t('nav.gifts')  },
        // Venue hosts get a shortcut to their dashboard.
        ...(user.role === 'HOST'
          ? [{ href: '/host', label: 'Host' }]
          : []),
      ]
    : [
        { href: '/',            label: t('nav.home')        },
        { href: '/guest-login', label: t('nav.guestAccess') },
      ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-[rgba(251,250,247,0.92)] backdrop-blur-xl border-b border-[var(--line)]'
          : 'bg-transparent'
      }`}
    >
      {/* Scroll progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute bottom-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-[var(--amber)] to-[var(--amber-hi)]"
      />
      <div className="wrap flex items-center justify-between h-16 gap-4">

        {/* Logo */}
        <Logo href="/" size="2rem" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <nav className="flex items-center mr-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3.5 py-2 text-sm font-medium text-[var(--ink-2)] rounded-lg transition hover:text-[var(--ink-1)] hover:bg-[var(--bg-2)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/account"
                className="px-3.5 py-2 text-sm font-medium text-[var(--ink-2)] rounded-lg transition hover:text-[var(--ink-1)] hover:bg-[var(--bg-2)]"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={async () => { await signOut(); router.push('/'); }}
                className="btn btn-ghost btn-sm"
              >
                {t('nav.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/host-signup"
                className="inline-flex px-3.5 py-2 text-sm font-medium text-[var(--ink-2)] rounded-lg transition hover:text-[var(--ink-1)] hover:bg-[var(--bg-2)]"
              >
                List your venue
              </Link>
              <Link
                href="/guest-login"
                className="inline-flex px-3.5 py-2 text-sm font-medium text-[var(--ink-2)] rounded-lg transition hover:text-[var(--ink-1)] hover:bg-[var(--bg-2)]"
              >
                {t('nav.guestAccess')}
              </Link>
              <Link href="/login">
                <button className="btn btn-ghost btn-sm">{t('nav.signIn')}</button>
              </Link>
              <Link href="/signup">
                <button className="btn btn-primary btn-sm">{t('nav.getStarted')}</button>
              </Link>
            </>
          )}

          <button
            onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
            className="inline-flex items-center ml-1 px-2.5 py-1.5 rounded-md text-xs font-semibold tracking-wider text-[var(--ink-3)] border border-[var(--line)] transition hover:text-[var(--ink-1)] hover:border-[var(--line-2)]"
          >
            {locale === 'en' ? 'ES' : 'EN'}
          </button>
        </div>

        {/* Mobile actions: primary CTA (logged-out) + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {!user && (
            <Link href="/login">
              <button className="btn btn-ghost btn-sm">{t('nav.signIn')}</button>
            </Link>
          )}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink-1)] transition hover:bg-[var(--bg-2)]"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-16 z-40 bg-[rgba(22,38,63,0.18)] md:hidden"
          />
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-16 z-50 border-b border-[var(--line)] bg-[var(--bg-1)] shadow-[0_18px_40px_-24px_rgba(22,38,63,0.4)] md:hidden"
          >
            <div className="wrap flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-[var(--ink-1)] transition hover:bg-[var(--bg-2)]"
                >
                  {item.label}
                </Link>
              ))}

              <div className="rule my-3" />

              {user ? (
                <div className="flex flex-col gap-2">
                  <Link href="/account" onClick={() => setMenuOpen(false)}>
                    <button className="btn btn-ghost w-full">Account</button>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => { setMenuOpen(false); await signOut(); router.push('/'); }}
                    className="btn btn-ghost w-full"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/signup" onClick={() => setMenuOpen(false)}>
                    <button className="btn btn-primary w-full">{t('nav.getStarted')}</button>
                  </Link>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <button className="btn btn-ghost w-full">{t('nav.signIn')}</button>
                  </Link>
                  <Link href="/host-signup" onClick={() => setMenuOpen(false)}>
                    <button className="btn btn-ghost w-full">List your venue</button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wider text-[var(--ink-2)] transition hover:bg-[var(--bg-2)]"
              >
                {locale === 'en' ? 'Español (ES)' : 'English (EN)'}
              </button>
            </div>
          </motion.nav>
        </>
      )}
    </header>
  );
}

export default SiteHeader;
