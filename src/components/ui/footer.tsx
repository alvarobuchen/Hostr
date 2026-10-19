'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useI18n } from '@/lib/i18n';
import { openCookiePreferences } from '@/lib/cookie-consent';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg)]">
      <div className="wrap py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Logo href={null} />
            <p className="text-sm leading-6 text-[var(--ink-2)] max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <p className="t-label mb-4">{t('footer.product')}</p>
            <ul className="space-y-2.5 text-sm text-[var(--ink-2)]">
              <li><Link href="/venues" className="transition hover:text-[var(--ink-1)]">{t('footer.venues')}</Link></li>
              <li><Link href="/gifts" className="transition hover:text-[var(--ink-1)]">{t('footer.giftCollections')}</Link></li>
              <li><Link href="/guest-login" className="transition hover:text-[var(--ink-1)]">{t('footer.guestCheckout')}</Link></li>
              <li><Link href="/host-signup" className="transition hover:text-[var(--ink-1)]">List your venue</Link></li>
            </ul>
          </div>

          <div>
            <p className="t-label mb-4">{t('footer.company')}</p>
            <ul className="space-y-2.5 text-sm text-[var(--ink-2)]">
              <li><a href="#" className="transition hover:text-[var(--ink-1)]">{t('footer.about')}</a></li>
              <li><a href="#" className="transition hover:text-[var(--ink-1)]">{t('footer.blog')}</a></li>
              <li><a href="#" className="transition hover:text-[var(--ink-1)]">{t('footer.careers')}</a></li>
            </ul>
          </div>

          <div>
            <p className="t-label mb-4">{t('footer.support')}</p>
            <ul className="space-y-2.5 text-sm text-[var(--ink-2)]">
              <li><Link href="/contact-us" className="transition hover:text-[var(--ink-1)]">{t('footer.contact')}</Link></li>
              <li><a href="#" className="transition hover:text-[var(--ink-1)]">{t('footer.help')}</a></li>
              <li><a href="#" className="transition hover:text-[var(--ink-1)]">{t('footer.status')}</a></li>
            </ul>
          </div>
        </div>

        <div className="rule mt-10" />
        <div className="pt-7 flex flex-col gap-3 text-sm text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="transition hover:text-[var(--ink-1)]">{t('footer.privacy')}</Link>
            <Link href="/terms-of-service" className="transition hover:text-[var(--ink-1)]">{t('footer.terms')}</Link>
            <button type="button" onClick={openCookiePreferences} className="transition hover:text-[var(--ink-1)]">{t('cookie.manage')}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
