'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import {
  ALL_ON,
  ESSENTIAL_ONLY,
  useCookieConsent,
  type Category,
  type Consent,
} from '@/lib/cookie-consent';

const TOGGLEABLE: Exclude<Category, 'necessary'>[] = ['functional', 'analytics', 'marketing'];

function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      style={{ background: on ? 'var(--gold)' : 'var(--ink-4)' }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
        style={{ left: on ? '1.5rem' : '0.125rem' }}
      />
    </button>
  );
}

export function CookieBanner() {
  const { t } = useI18n();
  const { consent, ready, prefsOpen, save, acceptAll, rejectAll, openPreferences, closePreferences } = useCookieConsent();
  const [draft, setDraft] = useState<Consent>(ESSENTIAL_ONLY);

  // Let any "Cookie preferences" link (e.g. the footer) open the dialog.
  useEffect(() => {
    const handler = () => openPreferences();
    window.addEventListener('cenit:open-cookie-prefs', handler);
    return () => window.removeEventListener('cenit:open-cookie-prefs', handler);
  }, [openPreferences]);

  // Seed the dialog from current consent each time it opens.
  useEffect(() => {
    if (prefsOpen) setDraft(consent ?? ESSENTIAL_ONLY);
  }, [prefsOpen, consent]);

  const showBanner = ready && !consent && !prefsOpen;

  const CATS = TOGGLEABLE.map((key) => ({
    key,
    name: t(`cookie.cat.${key}.name`),
    desc: t(`cookie.cat.${key}.desc`),
  }));

  return (
    <>
      {/* ── Consent banner ─────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 sm:pb-6"
          >
            <div className="card card-p mx-auto flex max-w-3xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="t-heading mb-1.5">{t('cookie.title')}</p>
                <p className="t-small">{t('cookie.body')}</p>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row md:shrink-0">
                <button className="btn btn-ghost btn-sm" onClick={() => openPreferences()}>{t('cookie.customize')}</button>
                <button className="btn btn-ghost btn-sm" onClick={rejectAll}>{t('cookie.rejectAll')}</button>
                <button className="btn btn-primary btn-sm" onClick={acceptAll}>{t('cookie.acceptAll')}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preferences dialog ─────────────────── */}
      <AnimatePresence>
        {prefsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={t('cookie.prefsTitle')}
          >
            <button aria-hidden tabIndex={-1} onClick={closePreferences} className="absolute inset-0 bg-[rgba(22,38,63,0.45)] backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 max-h-[88svh] w-full max-w-lg overflow-y-auto rounded-t-[22px] border border-[var(--line)] bg-[var(--bg-1)] p-6 shadow-[0_30px_80px_-30px_rgba(22,38,63,0.5)] sm:rounded-[22px] sm:p-8"
            >
              <p className="t-title text-[1.6rem]">{t('cookie.prefsTitle')}</p>
              <p className="t-small mt-2">{t('cookie.prefsBody')}</p>

              <div className="mt-6 space-y-3">
                {/* Necessary — locked on */}
                <div className="rounded-[14px] border border-[var(--line)] bg-[var(--bg-2)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink-1)]">{t('cookie.cat.necessary.name')}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--ink-2)]">{t('cookie.cat.necessary.desc')}</p>
                    </div>
                    <span className="t-label-amber shrink-0 pt-0.5" style={{ fontSize: '0.6rem' }}>{t('cookie.alwaysOn')}</span>
                  </div>
                </div>

                {/* Toggleable categories */}
                {CATS.map((cat) => (
                  <div key={cat.key} className="rounded-[14px] border border-[var(--line)] bg-[var(--bg-2)] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink-1)]">{cat.name}</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--ink-2)]">{cat.desc}</p>
                        {cat.key === 'marketing' && (
                          <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--ink-1)]">
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 rounded accent-[var(--amber)]"
                              checked={!draft.marketing}
                              onChange={(e) => setDraft((d) => ({ ...d, marketing: !e.target.checked }))}
                            />
                            {t('cookie.doNotSell')}
                          </label>
                        )}
                      </div>
                      <Toggle on={draft[cat.key]} onChange={(v) => setDraft((d) => ({ ...d, [cat.key]: v }))} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                <button className="btn btn-ghost btn-sm" onClick={() => save(ESSENTIAL_ONLY)}>{t('cookie.rejectAll')}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => save(ALL_ON)}>{t('cookie.acceptAll')}</button>
                <button className="btn btn-primary btn-sm" onClick={() => save({ ...draft, necessary: true })}>{t('cookie.save')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CookieBanner;
